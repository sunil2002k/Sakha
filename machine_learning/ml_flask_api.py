from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
from PyPDF2 import PdfReader
from PyPDF2.errors import PdfReadError
import io
from transformers import pipeline
import re
import os
import math

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in os.environ.get(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,https://sakha-peach.vercel.app",
    ).split(",")
    if origin.strip()
]
CORS(app, origins=allowed_origins)

PREDICTION_FIELDS = (
    "project_domain",
    "institution_type",
    "year",
    "team_size",
    "avg_team_experience",
    "innovation_score",
    "funding_amount_usd",
    "market_readiness_level",
    "competition_awards",
    "business_model_score",
    "technology_maturity",
    "mentorship_support",
    "incubation_support",
)
NUMERIC_PREDICTION_FIELDS = PREDICTION_FIELDS[2:]

# LOAD / TRAIN CLASSIFICATION MODEL

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTOR_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
PROJECTS_PATH = os.path.join(BASE_DIR, "projects.csv")

if not os.path.exists(VECTOR_PATH) or not os.path.exists(MODEL_PATH):
    print("Training classification model...")

    df = pd.read_csv(os.path.join(BASE_DIR, "sample_projects.csv"))

    X = df["description"]
    y = df["category"]

    vectorizer = TfidfVectorizer()
    X_vec = vectorizer.fit_transform(X)

    clf_model = LogisticRegression(max_iter=1000)
    clf_model.fit(X_vec, y)

    joblib.dump(vectorizer, VECTOR_PATH)
    joblib.dump(clf_model, MODEL_PATH)
    df.to_csv(PROJECTS_PATH, index=False)

else:
    print("Loading saved classification model...")
    vectorizer = joblib.load(VECTOR_PATH)
    clf_model = joblib.load(MODEL_PATH)

# LOAD SUCCESS PREDICTION MODEL

SUCCESS_MODEL_PATH = os.path.join(BASE_DIR, "startup_model.pkl")

Success_predict_model = None
if os.path.exists(SUCCESS_MODEL_PATH):
    try:
        Success_predict_model = joblib.load(SUCCESS_MODEL_PATH)
        print("Loaded success prediction model.")
    except Exception as e:
        print(f"Failed to load success prediction model: {e}")
else:
    print(f"Success prediction model not found at {SUCCESS_MODEL_PATH}. Predict route will be unavailable.")

# LOAD SUMMARIZER 

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# ROUTES

@app.errorhandler(413)
def request_entity_too_large(_error):
    return jsonify({"error": "Request exceeds the 10 MB limit"}), 413


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze-description", methods=["POST"])
def analyze_description():
    try:
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify({"error": "A JSON object is required"}), 400

        text = payload.get("text")
        if not isinstance(text, str) or not text.strip():
            return jsonify({"error": "No text provided"}), 400
        if len(text) > 10000:
            return jsonify({"error": "Text exceeds the 10,000 character limit"}), 400

        text_vec = vectorizer.transform([text.strip()])
        prediction = clf_model.predict(text_vec)[0]

        return jsonify({
            "description": text,
            "category": prediction
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/predict', methods=['POST'])
def predict():
    try:
        if Success_predict_model is None:
            return jsonify({'error': 'Success prediction model not available on server'}), 503
        req_data = request.get_json(silent=True)
        if not isinstance(req_data, dict):
            return jsonify({"error": "A JSON object is required"}), 400

        missing_fields = [field for field in PREDICTION_FIELDS if field not in req_data]
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing_fields": missing_fields,
            }), 400

        for field in NUMERIC_PREDICTION_FIELDS:
            value = req_data[field]
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                return jsonify({"error": f"{field} must be a finite number"}), 400
            try:
                is_finite_number = math.isfinite(value)
            except OverflowError:
                is_finite_number = False
            if not is_finite_number:
                return jsonify({"error": f"{field} must be a finite number"}), 400

        if req_data["team_size"] <= 0:
            return jsonify({"error": "team_size must be greater than zero"}), 400

        for field in ("project_domain", "institution_type"):
            if not isinstance(req_data[field], str) or not req_data[field].strip():
                return jsonify({"error": f"{field} must be a non-empty string"}), 400

        input_df = pd.DataFrame([{
            field: req_data[field] for field in PREDICTION_FIELDS
        }])

        # Feature Engineering
        input_df['funding_per_member'] = (
            input_df['funding_amount_usd'] / input_df['team_size']
        )
        input_df['exp_innovation'] = (
            input_df['avg_team_experience'] * input_df['innovation_score']
        )
        input_df['support_score'] = (
            input_df['mentorship_support'] + input_df['incubation_support']
        )

        probability = Success_predict_model.predict_proba(input_df)[:, 1][0]
        prediction = Success_predict_model.predict(input_df)[0]

        return jsonify({
            'prediction': 'Success' if prediction == 1 else 'Failure',
            'success_probability': f'{probability:.2%}'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/analyze-pdf", methods=["POST"])
def analyze_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "File must be a PDF"}), 400

        try:
            pdf_reader = PdfReader(io.BytesIO(file.read()))
        except (PdfReadError, EOFError, ValueError):
            return jsonify({"error": "The uploaded file is not a valid PDF"}), 400
        if len(pdf_reader.pages) > 100:
            return jsonify({"error": "PDF must not exceed 100 pages"}), 400
        if not pdf_reader.pages:
            return jsonify({"error": "PDF contains no pages"}), 400

        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
            if len(text) > 50000:
                break

        lines = [line.strip() for line in text.split('\n') if line.strip()]
        full_text = "\n".join(lines)
        if not full_text:
            return jsonify({"error": "No readable text was found in the PDF"}), 400

        # ---------- TITLE ----------
        title_context = "\n".join(lines[:10])
        title_output = summarizer(
            title_context[:1000],
            max_length=15,
            min_length=3,
            do_sample=False
        )
        title = title_output[0]['summary_text'].strip()

        # ---------- DESCRIPTION ----------
        content_for_summary = full_text[:3000]

        desc_output = summarizer(
            content_for_summary,
            max_length=130,
            min_length=30,
            do_sample=False
        )
        description = desc_output[0]['summary_text']

        # TECH STACK EXTRACTION 
        tech_keywords = [
            "python", "django", "flask", "react", "node",
            "express", "mongodb", "postgresql", "mysql",
            "tensorflow", "pytorch", "docker", "aws",
            "azure", "gcp", "javascript", "html", "css"
        ]

        found = set()
        for kw in tech_keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", full_text, re.IGNORECASE):
                found.add(kw)

        tech_stack = ", ".join(sorted(found)) if found else "N/A"

        #CATEGORY PREDICTION 
        text_vec = vectorizer.transform([description])
        category = clf_model.predict(text_vec)[0]

        return jsonify({
            "title": title,
            "description": description,
            "tech_stack": tech_stack,
            "category": category
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 7860)))
