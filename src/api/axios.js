import axios from "axios";

const api = axios.create({
  // baseURL: "https://optimuskart-api-524416763055.asia-south2.run.app/",
  baseURL: "http://localhost:3157/",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = sessionStorage.getItem("token");

    if (error.response?.status === 401 && !token) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
