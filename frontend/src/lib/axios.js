import axios from "axios";

const API_ORIGIN = (
  import.meta.env.VITE_APP_URL || "https://sakha-bu0z.onrender.com"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/i, "");
const BASE_URL = `${API_ORIGIN}/api/v1`;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});