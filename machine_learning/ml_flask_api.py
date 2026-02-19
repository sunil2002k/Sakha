from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
from PyPDF2 import PdfReader
import io
from transformers import pipeline
import re
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# LOAD / TRAIN CLASSIFICATION MODEL

VECTOR_PATH = "vectorizer.pkl"
MODEL_PATH = "model.pkl"
PROJECTS_PATH = "projects.csv"

if not os.path.exists(VECTOR_PATH) or not os.path.exists(MODEL_PATH):
    print("Training classification model...")

    df = pd.read_csv("machine_learning/sample_projects.csv")

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

SUCCESS_MODEL_PATH = "machine_learning\startup_model.pkl"
Success_predict_model = joblib.load(SUCCESS_MODEL_PATH)

# LOAD SUMMARIZER 

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# ROUTES

@app.route("/analyze-description", methods=["POST"])
def analyze_description():
    try:
        text = request.json.get("text", "")
        if not text:
            return jsonify({"error": "No text provided"}), 400

        text_vec = vectorizer.transform([text])
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
        req_data = request.get_json()

        required_fields = [
            'funding_amount_usd',
            'team_size',
            'avg_team_experience',
            'innovation_score',
            'mentorship_support',
            'incubation_support'
        ]

        for field in required_fields:
            if field not in req_data:
                return jsonify({'error': f'Missing field: {field}'}), 400

        input_df = pd.DataFrame([req_data])

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

        pdf_reader = PdfReader(io.BytesIO(file.read()))

        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""

        lines = [line.strip() for line in text.split('\n') if line.strip()]
        full_text = "\n".join(lines)

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
    app.run(debug=True)
