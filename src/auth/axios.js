import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_API_BASE_URL,
  // baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (response.config.url === "/auth/otp/verify") {
      const { token, first_name, user_id, user__id, user_type } =
        response.data?.data ?? {};
      const verifiedUserId = user_id || user__id;

      if (token) sessionStorage.setItem("token", token);
      if (first_name) sessionStorage.setItem("first_name", first_name);
      if (verifiedUserId) sessionStorage.setItem("user_id", String(verifiedUserId));
      if (user_type) sessionStorage.setItem("user_type", user_type);
    }

    return response;
  },
  (error) => Promise.reject(error),
);
