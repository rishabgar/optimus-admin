import api from "./axios";

export const getUsersByType = async (userType) => {
  const response = await api.get("/user/all", {
    params: {
      user_type: userType,
    },
  });

  return response.data?.data ?? [];
};

export const getUserStats = async () => {
  const response = await api.get("/user/stats");

  return response.data?.data ?? {};
};
