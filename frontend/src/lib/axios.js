import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "https://sakha-bu0z.onrender.com/api/v1" : "https://sakha-bu0z.onrender.com/api/v1";

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