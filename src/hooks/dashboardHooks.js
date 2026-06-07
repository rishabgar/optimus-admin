import { useQuery } from "@tanstack/react-query";
import {
  getAdminProductsByCategoryApi,
  getCategoriesBySellerApi,
  getCommonCategoriesApi,
  getCommonCategoriesByShopTypeApi,
  getCommonProductsApi,
  getProductsBySellerApi,
  getShopTypesApi,
} from "../auth/dashboardApi";

export function useGetShopTypes() {
  return useQuery({
    queryKey: ["shop-types"],
    queryFn: getShopTypesApi,
  });
}

export function useGetCategoriesBySeller(sellerId) {
  return useQuery({
    queryKey: ["seller-categories", sellerId],
    queryFn: () => getCategoriesBySellerApi(sellerId),
    enabled: Boolean(sellerId),
  });
}

export function useGetCommonCategories(pageNo, limit, enabled = true) {
  return useQuery({
    queryKey: ["common-categories", pageNo, limit],
    queryFn: () => getCommonCategoriesApi(pageNo, limit),
    enabled,
  });
}

export function useGetCommonCategoriesByShopType(shopTypeId) {
  return useQuery({
    queryKey: ["common-categories-by-shop-type", shopTypeId],
    queryFn: () => getCommonCategoriesByShopTypeApi(shopTypeId),
    enabled: Boolean(shopTypeId),
  });
}

export function useGetProductsBySeller(sellerId) {
  return useQuery({
    queryKey: ["seller-products", sellerId],
    queryFn: () => getProductsBySellerApi(sellerId),
    enabled: Boolean(sellerId),
  });
}

export function useGetCommonProducts(pageNo, limit, enabled = true) {
  return useQuery({
    queryKey: ["common-products", pageNo, limit],
    queryFn: () => getCommonProductsApi(pageNo, limit),
    enabled,
  });
}

export function useGetAdminProductsByCategory(categoryId) {
  return useQuery({
    queryKey: ["admin-products-by-category", categoryId],
    queryFn: () => getAdminProductsByCategoryApi(categoryId),
    enabled: Boolean(categoryId),
  });
}
