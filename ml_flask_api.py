from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
import joblib
from PyPDF2 import PdfReader
import io
from transformers import pipeline
import re

# Initialize summarizer (loads model once)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Load & preprocess data
data = pd.read_csv("sample_projects.csv")

# --- Classification Training ---
X = data["description"]
y = data["category"]
vec = TfidfVectorizer()
X_vec = vec.fit_transform(X)
clf_model = LogisticRegression()
clf_model.fit(X_vec, y)

# Save components
joblib.dump(vec, "vectorizer.pkl")
joblib.dump(clf_model, "model.pkl")
joblib.dump(X_vec, "desc_vec.pkl")
data.to_csv("projects.csv", index=False)

# --- Regression Training (predicting success score) ---
# Fake success_score for training (you can replace this with real metrics later)
np.random.seed(42)
data["success_score"] = np.random.uniform(50, 95, size=len(data))

# Add length of description as a feature
data["desc_length"] = data["description"].apply(lambda x: len(x.split()))

# One-hot encode categories
cat_encoded = pd.get_dummies(data["category"], drop_first=True)

# Features
features = pd.concat([
    pd.DataFrame(X_vec.toarray()),  # TF-IDF
    cat_encoded.reset_index(drop=True),  # Category one-hot
    data["desc_length"].reset_index(drop=True)
], axis=1)

features.columns = features.columns.astype(str)  # <-- Add this line

target = data["success_score"]

# Train the regressor
reg_model = RandomForestRegressor(n_estimators=100, random_state=42)
reg_model.fit(features, target)
joblib.dump(reg_model, "regressor.pkl")

# --- Flask App Starts ---
app = Flask(__name__)
CORS(app)

@app.route("/analyze-description", methods=["POST"])
def analyze():
    text = request.json["text"]
    vec = joblib.load("vectorizer.pkl")
    model = joblib.load("model.pkl")
    text_vec = vec.transform([text])
    prediction = model.predict(text_vec)[0]
    return jsonify({"description": text, "category": prediction})

@app.route("/recommend", methods=["POST"])
def recommend():
    text = request.json["text"]
    vec = joblib.load("vectorizer.pkl")
    desc_vec = joblib.load("desc_vec.pkl")
    projects = pd.read_csv("projects.csv")

    input_vec = vec.transform([text])
    similarities = cosine_similarity(input_vec, desc_vec).flatten()
    top_indices = similarities.argsort()[-3:][::-1]

    recommendations = []
    for idx in top_indices:
        recommendations.append({
            "description": projects.iloc[idx]["description"],
            "category": projects.iloc[idx]["category"],
            "similarity_score": round(float(similarities[idx]), 3)
        })

    return jsonify({"input": text, "recommendations": recommendations})

@app.route("/predict-success", methods=["POST"])
def predict_success():
    try:
        req = request.json
        text = req["text"]
        category = req["category"]
        desc_length = len(text.split())

        vec = joblib.load("vectorizer.pkl")
        model = joblib.load("regressor.pkl")
        clf_model = joblib.load("model.pkl")

        text_vec = vec.transform([text]).toarray()
        all_categories = clf_model.classes_

        # Create one-hot encoded vector for input category
        cat_vector = np.array([1 if cat == category else 0 for cat in all_categories[1:]]).reshape(1, -1)

        # Combine features
        final_input = np.hstack([text_vec, cat_vector, [[desc_length]]])
        prediction = model.predict(final_input)[0]

        return jsonify({"success_score": round(prediction, 2)})
    except Exception as e:
        print("Error in /predict-success:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/analyze-pdf", methods=["POST"])
def analyze_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        file = request.files['file']
        if not file.filename.endswith('.pdf'):
            return jsonify({"error": "File is not a PDF"}), 400

        # Read PDF content
        pdf_reader = PdfReader(io.BytesIO(file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""

        # Split lines for easier parsing
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        full_text = "\n".join(lines)

        # --- Section Headers ---
        section_headers = [
            "introduction", "literature review", "problem statement", "objectives",
            "methodology", "expected outcome", "expected outcomes", "outcomes", "tech stack", "technology",
            "tools", "references"
        ]

        # --- Prompt-based Title Extraction ---
        # Use the first 2-3 lines as context for the title
        title_context = "\n".join(lines[:5])
        title_prompt = "Extract the project title from the following text:"
        title_summary = summarizer(title_prompt + "\n" + title_context, max_length=15, min_length=3, do_sample=False)[0]['summary_text']
        title = title_summary.strip()

        # --- Section Extraction Helper ---
        def extract_section(lines, start_keywords, end_keywords):
            start_idx = None
            end_idx = None
            for i, line in enumerate(lines):
                if start_idx is None and any(kw in line.lower() for kw in start_keywords):
                    start_idx = i + 1
                elif start_idx is not None and any(kw in line.lower() for kw in end_keywords):
                    end_idx = i
                    break
            if start_idx is not None:
                return " ".join(lines[start_idx:end_idx]) if end_idx else " ".join(lines[start_idx:])
            return ""

        # --- Description from Introduction ---
        intro_text = extract_section(
            lines,
            start_keywords=["introduction"],
            end_keywords=["problem statement", "objectives", "methodology", "expected outcome", "expected outcomes", "outcomes", "tech stack", "technology", "tools", "references"]
        )
        if intro_text:
            prompt = "Summarize the following project introduction and objectives:"
            description = summarizer(prompt + "\n" + intro_text[:3000], max_length=130, min_length=30, do_sample=False)[0]['summary_text']
        else:
            # fallback: summarize all content except headers and title
            content_lines = [l for l in lines if l != title and l.lower() not in section_headers]
            content = "\n".join(content_lines)
            description = summarizer(content[:3000], max_length=130, min_length=30, do_sample=False)[0]['summary_text'] if content else ""

        # --- Expected Outcomes Extraction ---
        outcomes_text = extract_section(
            lines,
            start_keywords=["expected outcome", "expected outcomes", "outcomes", "objectives"],
            end_keywords=["methodology", "tech stack", "technology", "tools", "references"]
        )
        if outcomes_text:
            prompt = "Summarize the following project expected outcomes and objectives:"
            summarized_outcomes = summarizer(prompt + "\n" + outcomes_text[:3000], max_length=80, min_length=20, do_sample=False)[0]['summary_text']
            if len(summarized_outcomes.split()) < 5:
                expected_outcomes = "N/A"
            else:
                expected_outcomes = summarized_outcomes
        else:
            expected_outcomes = "N/A"

        # --- Prompt-based Tech Stack Extraction ---
        tech_text = extract_section(
            lines,
            start_keywords=["tech stack", "technical feasibility", "technology", "tools used", "technologies used"],
            end_keywords=["references", "methodology", "expected outcome", "expected outcomes", "outcomes"]
        )
        if tech_text:
            tech_prompt = "List the main technologies, frameworks, and tools used in this project:"
            summarized_tech = summarizer(tech_prompt + "\n" + tech_text[:1000], max_length=40, min_length=5, do_sample=False)[0]['summary_text']
            tech_stack = summarized_tech.strip()
        else:
            # fallback: extract tech keywords from the whole text
            tech_keywords = [
                "python", "django", "flask", "react", "node", "express", "mongodb", "postgresql", "mysql",
                "api", "tensorflow", "pytorch", "huggingface", "transformers", "docker", "kubernetes", "aws",
                "azure", "gcp", "javascript", "typescript", "html", "css", "tailwind", "bootstrap"
            ]
            found = set()
            for kw in tech_keywords:
                if re.search(r"\b" + re.escape(kw) + r"\b", full_text, re.IGNORECASE):
                    found.add(kw)
            tech_stack = ", ".join(sorted(found)) if found else "N/A"

        # --- ML predictions ---
        vec = joblib.load("vectorizer.pkl")
        clf_model = joblib.load("model.pkl")
        reg_model = joblib.load("regressor.pkl")

        # Predict category
        text_vec = vec.transform([description])
        category = clf_model.predict(text_vec)[0]

        # Predict success
        desc_length = len(description.split())
        all_categories = clf_model.classes_
        cat_vector = np.array([1 if cat == category else 0 for cat in all_categories[1:]]).reshape(1, -1)
        final_input = np.hstack([text_vec.toarray(), cat_vector, [[desc_length]]])
        success_score = reg_model.predict(final_input)[0]

        return jsonify({
            "title": title,
            "description": description,
            "expected_outcomes": expected_outcomes,
            "tech_stack": tech_stack,
            "category": category,
            "success_score": round(success_score, 2)
        })
    except Exception as e:
        print("Error in /analyze-pdf:", e)
        return jsonify({"error": str(e)}), 500

def extract_section(lines, start_keywords, end_keywords):
    start_idx = None
    end_idx = None
    for i, line in enumerate(lines):
        if start_idx is None and any(kw in line.lower() for kw in start_keywords):
            start_idx = i + 1
        elif start_idx is not None and any(kw in line.lower() for kw in end_keywords):
            end_idx = i
            break
    if start_idx is not None:
        return " ".join(lines[start_idx:end_idx]) if end_idx else " ".join(lines[start_idx:])
    return ""

if __name__ == "__main__":
    app.run(debug=True)
