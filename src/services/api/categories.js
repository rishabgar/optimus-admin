import api from "./axios";

export const getCategoriesByShopType = async (shopTypeId) => {
  const response = await api.get(`/categories/shop_type_id/${shopTypeId}`);

  return response.data?.data ?? [];
};
