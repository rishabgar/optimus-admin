import axios from "axios";

const baseURL =
  import.meta.env.VITE_ENVIRONMENT === "production"
    ? import.meta.env.VITE_PRODUCTION_API_URL
    : import.meta.env.VITE_DEVELOPMENT_API_URL;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("optimuskart_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
