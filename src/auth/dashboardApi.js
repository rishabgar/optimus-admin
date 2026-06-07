import { api } from "./axios";

export async function getUserApi(user_type = "customer") {
  const response = await api.get(`/user/all?user_type=${user_type}`);

  return response.data;
}

export async function getCategoriesByShopApi(shop_id) {
  const response = await api.get(`/categories/shop_id/${shop_id}`);

  return response.data;
}

export async function getCategoriesByShopTypeApi(shop_type_id) {
  const response = await api.get(`/categories/shop_type_id/${shop_type_id}`);

  return response.data;
}

export async function getCategoriesBySellerApi(seller_id) {
  const response = await api.get(`/categories/seller_id/${seller_id}`);

  return response.data;
}

export async function getCommonCategoriesApi(page_no = 1, limit = 10) {
  const response = await api.get(
    `/categories/common?page_no=${page_no}&limit=${limit}`,
  );

  return response.data;
}

export async function getCommonCategoriesByShopTypeApi(shop_type_id) {
  const response = await api.get(`/product/common/category/${shop_type_id}`);

  return response.data;
}

export async function getProductsBySellerApi(seller_id) {
  const response = await api.get(`/product/seller/${seller_id}`);

  return response.data;
}

export async function getCommonProductsApi(page_no = 1, limit = 20) {
  const response = await api.get(
    `/product/common?page_no=${page_no}&limit=${limit}`,
  );

  return response.data;
}

export async function getAdminProductsByCategoryApi(product_category_id) {
  const response = await api.get(`/product/admin/${product_category_id}`);

  return response.data;
}

export async function getShopTypesApi() {
  const response = await api.get("/shop/type");

  return response.data;
}

export async function getUploadSignedUrlApi(user_id) {
  const response = await api.get(`/upload/signed/url/${user_id}`);

  return response.data;
}

export async function createProductCategoryApi(endpoint, payload) {
  const response = await api.post(endpoint, payload);

  return response.data;
}

export async function updateProductCategoryApi(endpoint, payload) {
  const response = await api.patch(endpoint, payload);

  return response.data;
}

export async function deleteProductCategoryApi(endpoint) {
  const response = await api.delete(endpoint);

  return response.data;
}

export async function createShopTypeApi(endpoint, payload) {
  const response = await api.post(endpoint, payload);

  return response.data;
}

export async function updateShopTypeApi(endpoint, payload) {
  const response = await api.put(endpoint, payload);

  return response.data;
}

export async function deleteShopTypeApi(endpoint) {
  const response = await api.delete(endpoint);

  return response.data;
}

export async function createProductApi(endpoint, payload) {
  const response = await api.post(endpoint, payload);

  return response.data;
}

export async function updateProductApi(endpoint, payload) {
  const response = await api.patch(endpoint, payload);

  return response.data;
}

export async function deleteProductApi(endpoint) {
  const response = await api.delete(endpoint);

  return response.data;
}
