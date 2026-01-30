import os
import io
import re
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# --- LOAD ARTIFACTS ONCE ---
# NLP Tooling
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
tfidf_vec = joblib.load("artifacts/vectorizer.pkl")

# Success Predictor (Neural Network from Colab)
nn_model = tf.keras.models.load_model("artifacts/success_model.keras")
scaler = joblib.load("artifacts/scaler.pkl")
cat_encoder = joblib.load("artifacts/category_encoder.pkl")

def process_success_input(data):
    """
    Transforms raw JSON input into the scaled format expected by the NN.
    Expects keys: 'goal', 'duration', 'launch_month', 'category'
    """
    # 1. Encode Category string to Number
    cat_num = cat_encoder.transform([data['category']])[0]
    
    # 2. Build feature array (must match the order in your Colab X_train)
    # Example order: [usd_goal_real, duration, launch_month, category_encoded]
    features = np.array([[
        float(data['goal']), 
        int(data['duration']), 
        int(data['launch_month']), 
        cat_num
    ]])
    
    # 3. Apply the same scaling from training
    return scaler.transform(features)

@app.route("/predict-success", methods=["POST"])
def predict_success():
    try:
        req_data = request.json
        # Transform and Predict
        processed_input = process_success_input(req_data)
        prediction = nn_model.predict(processed_input)
        
        # Convert sigmoid output (0-1) to percentage
        score = float(prediction[0][0]) * 100
        
        return jsonify({
            "success_score": round(score, 2),
            "recommendation": "High Potential" if score > 80 else "Needs Optimization"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze-pdf", methods=["POST"])
def analyze_pdf():
    # PDF parsing logic remains the same...
    # Use BART to extract title/description, then pipe results into the NN
    # Use default values for goal/duration if not found in PDF
    dummy_data = {"goal": 5000, "duration": 30, "launch_month": 1, "category": "Technology"}
    score = predict_success_internal(dummy_data) 
    return jsonify({"score": score}) # + other extracted PDF data

if __name__ == "__main__":
    app.run(port=5000, debug=True)