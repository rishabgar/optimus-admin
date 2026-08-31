import api from "./axios";

export const getIndexedProducts = async (page = 1) => {
  const response = await api.get("/elasticSearch/indexed-products", {
    params: { page },
  });

  return (
    response.data?.data ?? {
      data: [],
      total: 0,
      page,
      limit: 10,
      totalPages: 1,
      hasMore: false,
    }
  );
};

export const deleteIndexedProduct = async (productId) => {
  const response = await api.delete(
    `/elasticSearch/indexed-products/${encodeURIComponent(productId)}`,
  );

  return response.data;
};

export const clearIndexedProducts = async () => {
  const response = await api.delete("/elasticSearch/indexed-products");

  return response.data;
};
