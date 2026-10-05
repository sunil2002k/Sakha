const configuredUrl = import.meta.env.VITE_AI_SERVICE_URL?.trim();

export const AI_SERVICE_URL = (
  configuredUrl || "http://localhost:7860"
).replace(/\/+$/, "");
