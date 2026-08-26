import api from "./axios";

export const authenticateUser = async ({ email, password }) => {
  const response = await api.post("/auth/admin/login", {
    user_email: email,
    password: password,
  });

  return response.data;
};
