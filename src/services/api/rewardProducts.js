import api from "./axios";

export const getRewardProducts = async (page = 1) => {
  const response = await api.get("/rewardProducts", {
    params: { page_no: page, limit: 10 },
  });

  return (
    response.data?.data ?? {
      page_no: page,
      limit: 10,
      totalProducts: 0,
      totalPages: 1,
      products: [],
    }
  );
};

export const createRewardProduct = async (rewardProductData) => {
  const response = await api.post("/rewardProducts/create", rewardProductData);

  return response.data;
};
