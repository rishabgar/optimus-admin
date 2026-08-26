import api from "./axios";

export const getShopTypes = async () => {
  const response = await api.get("/shop/type");

  return response.data?.data ?? [];
};

export const getShopsByType = async (shopTypeId) => {
  const response = await api.get(`/shop/type/${shopTypeId}`);

  return response.data?.data ?? [];
};
