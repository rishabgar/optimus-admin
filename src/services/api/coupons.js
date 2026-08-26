import api from "./axios";

export const getCoupons = async () => {
  const response = await api.get("/coupons");

  return response.data?.data ?? [];
};

export const createCoupon = async (couponData) => {
  const response = await api.post("/coupons/create", couponData);

  return response.data;
};

export const updateCoupon = async ({ code, couponData }) => {
  const response = await api.patch(
    `/coupons/${encodeURIComponent(code)}`,
    couponData,
  );

  return response.data;
};

export const deleteCoupon = async (code) => {
  const response = await api.delete(`/coupons/${encodeURIComponent(code)}`);

  return response.data;
};
