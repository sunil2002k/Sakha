---
title: Sakha AI Service
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Sakha AI Service

This Docker service hosts the Flask endpoints used by Sakha for PDF analysis,
project classification, and startup success prediction.

## Deploy as a Hugging Face Space

1. Create a Hugging Face Space using the **Docker** SDK.
2. Connect this repository to the Space, or push the repository contents to it.
   The Space must build from the repository root so it can use the root
   `Dockerfile`.
3. In the Space settings, add `FRONTEND_ORIGINS` with the exact deployed
   frontend origin, for example `https://sakha-peach.vercel.app`. For multiple
   frontend origins, use a comma-separated list.
4. Wait for the Space to finish building and starting. Its health endpoint is
   `https://<space-name>.hf.space/health`.
5. In Vercel project settings, set `VITE_AI_SERVICE_URL` to
   `https://<space-name>.hf.space`, then redeploy the frontend.

The first startup downloads the `facebook/bart-large-cnn` summarization model,
so it can take several minutes. The Space needs enough memory to load that
model. The committed `.pkl` models and `sample_projects.csv` are included in
the Docker image.

## Backend production configuration

Configure these values in the backend host's environment settings (never commit
secret values):

- `NODE_ENV=production`
- `DB_URI` with the production MongoDB connection string
- `JWT_SECRET` with a strong, randomly generated secret
- `FRONTEND_URL` with the deployed frontend origin, for payment redirects
- Optionally, `FRONTEND_ORIGINS` with a comma-separated allowlist of browser
  origins if more than one frontend domain is used

The server refuses to start in production without `JWT_SECRET` or `DB_URI`.
Credentialed CORS is limited to the configured frontend origins.

## Local development

Install `machine_learning/requirements.txt`, then start the service from the
repository root:

```sh
python -m pip install -r machine_learning/requirements.txt
python -m machine_learning.ml_flask_api
```

Set `VITE_AI_SERVICE_URL=http://localhost:7860` in the frontend environment
when using the local service.
