import api from "./axios";

export const getProductsByShop = async (shopId, page = 1) => {
  const response = await api.get(`/product/${shopId}`, {
    params: { page },
  });

  return (
    response.data?.data ?? {
      page,
      limit: 10,
      totalProducts: 0,
      totalPages: 1,
      products: [],
    }
  );
};

export const getAdminProductsByCategory = async (productCategoryId, page = 1) => {
  const response = await api.get(`/product/admin/${productCategoryId}`, {
    params: { page_no: page },
  });

  return (
    response.data?.data ?? {
      page,
      limit: 10,
      totalProducts: 0,
      totalPages: 1,
      products: [],
    }
  );
};

export const createProduct = async (productData) => {
  const response = await api.post("/product/admin/create", productData);

  return response.data;
};
