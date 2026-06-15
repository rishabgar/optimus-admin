import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ShopTypeSection from "../components/ShopTypeSection";
import CategorySection from "../components/CategorySection";
import ProductSection from "../components/ProductSection";
import {
  useGetCategoriesBySeller,
  useGetCommonCategories,
  useGetCommonProducts,
  useGetProductsBySeller,
  useGetShopTypes,
} from "../hooks/dashboardHooks";

const COMMON_CATEGORIES_LIMIT = 10;
const COMMON_PRODUCTS_LIMIT = 20;

export default function InventoryServicePage() {
  const [searchParams] = useSearchParams();
  const urlSellerId = searchParams.get("sellerId");
  const [commonCategoriesPage, setCommonCategoriesPage] = useState(1);
  const [commonProductsPage, setCommonProductsPage] = useState(1);
  const {
    data: shopTypesResponse,
    isLoading: isShopTypesLoading,
    isError: isShopTypesError,
  } = useGetShopTypes();
  const {
    data: sellerCategoriesResponse,
    isLoading: isSellerCategoriesLoading,
    isError: isSellerCategoriesError,
  } = useGetCategoriesBySeller(urlSellerId);
  const {
    data: commonCategoriesResponse,
    isLoading: isCommonCategoriesLoading,
    isError: isCommonCategoriesError,
  } = useGetCommonCategories(
    commonCategoriesPage,
    COMMON_CATEGORIES_LIMIT,
    !urlSellerId,
  );
  const {
    data: sellerProductsResponse,
    isLoading: isSellerProductsLoading,
    isError: isSellerProductsError,
  } = useGetProductsBySeller(urlSellerId);
  const {
    data: commonProductsResponse,
    isLoading: isCommonProductsLoading,
    isError: isCommonProductsError,
  } = useGetCommonProducts(
    commonProductsPage,
    COMMON_PRODUCTS_LIMIT,
    !urlSellerId,
  );

  const [shopTypes, setShopTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopTypeOverrides, setShopTypeOverrides] = useState({});
  const [categoryOverrides, setCategoryOverrides] = useState({});
  const [productOverrides, setProductOverrides] = useState({});
  const [deletedShopTypeIds, setDeletedShopTypeIds] = useState([]);
  const [deletedCategoryIds, setDeletedCategoryIds] = useState([]);
  const [deletedProductIds, setDeletedProductIds] = useState([]);

  const activeRole = sessionStorage.getItem("user_type");
  const currentUserId = sessionStorage.getItem("user_id");
  const currentUserName = sessionStorage.getItem("first_name");

  const apiShopTypes = useMemo(() => {
    if (!shopTypesResponse?.data) return [];

    return shopTypesResponse.data.map((shopType) => ({
      id: shopType.shop_type_id,
      name: shopType.shop_type_name,
      image: shopType.shop_type_image,
      status: "Active",
      createdAt: "API",
    }));
  }, [shopTypesResponse]);

  const visibleShopTypes = useMemo(
    () =>
      [...apiShopTypes, ...shopTypes]
        .filter((shopType) => !deletedShopTypeIds.includes(shopType.id))
        .map((shopType) => ({
          ...shopType,
          ...(shopTypeOverrides[shopType.id] ?? {}),
        })),
    [apiShopTypes, deletedShopTypeIds, shopTypeOverrides, shopTypes],
  );

  const apiCategories = useMemo(() => {
    if (!urlSellerId || !sellerCategoriesResponse?.data) return [];

    return sellerCategoriesResponse.data.flatMap((seller) =>
      (seller.product_categories ?? []).map((category) => ({
        id: category.product_category_id,
        name: category.product_category_name,
        type: category.product_category_type,
        image: category.product_category_image,
        shopTypeId: seller.shop_type_id,
        shopId: seller.shop_id,
        shopTypeName: category.product_category_type || "Category",
        sellerId: seller.seller_id,
        createdAt: "API",
      })),
    );
  }, [sellerCategoriesResponse, urlSellerId]);

  const apiCommonCategories = useMemo(() => {
    if (urlSellerId || !commonCategoriesResponse?.data) return [];

    return commonCategoriesResponse.data.map((category) => ({
      id: category.product_category_id,
      name: category.product_category_name,
      type: category.product_category_type,
      image: category.product_category_image,
      shopTypeId: category.shop_type_id,
      shopId: category.shop_id,
      shopTypeName: category.product_category_type || "Category",
      sellerId: "",
      createdAt: "API",
    }));
  }, [commonCategoriesResponse, urlSellerId]);

  const visibleCategories = useMemo(() => {
    const allCategories = !urlSellerId
      ? [...apiCommonCategories, ...categories]
      : [
          ...apiCategories,
          ...categories.filter(
            (category) => String(category.sellerId) === String(urlSellerId),
          ),
        ];

    return allCategories
      .filter((category) => !deletedCategoryIds.includes(category.id))
      .map((category) => ({
        ...category,
        ...(categoryOverrides[category.id] ?? {}),
      }));
  }, [
    apiCategories,
    apiCommonCategories,
    categories,
    categoryOverrides,
    deletedCategoryIds,
    urlSellerId,
  ]);

  const apiProducts = useMemo(() => {
    if (!urlSellerId || !sellerProductsResponse?.data) return [];

    return sellerProductsResponse.data.map((product) => {
      const category = visibleCategories.find(
        (item) => item.id === product.product_category_id,
      );
      const mainImage =
        product.product_images?.find((image) => image.is_main === false) ??
        product.product_images?.find((image) => image.is_main === true) ??
        product.product_images?.[0];

      return {
        id: product.product_id,
        name: product.product_name,
        categoryId: product.product_category_id,
        categoryName: category?.name || "Uncategorized",
        shopTypeId: product.shop_type_id || category?.shopTypeId,
        shopId: product.shop_id || category?.shopId,
        brandName: product.brand_name,
        price: product.product_price,
        stock: product.available_quantity,
        productQuantity: product.product_quantity,
        quantityPrefix: product.quantity_prefix,
        productWeight: product.product_weight,
        weightPrefix: product.weight_prefix,
        availableQuantity: product.available_quantity,
        description: product.product_description,
        image: mainImage?.url,
        productImages: product.product_images ?? [],
        availability: product.availability,
        isPrescriptionRequired: product.is_prescription_required,
        isRewardProduct: product.is_reward_product,
        rewardTokensRequired: product.reward_tokens_required,
        sellerId: urlSellerId,
        sellerName: `Seller #${urlSellerId}`,
        createdAt: "API",
      };
    });
  }, [sellerProductsResponse, urlSellerId, visibleCategories]);

  const apiCommonProducts = useMemo(() => {
    if (urlSellerId || !commonProductsResponse?.data) return [];

    return commonProductsResponse.data.map((product) => {
      const category = visibleCategories.find(
        (item) => item.id === product.product_category_id,
      );
      const mainImage =
        product.product_images?.find((image) => image.is_main === true) ??
        product.product_images?.[0];

      return {
        id: product.product_id,
        name: product.product_name,
        categoryId: product.product_category_id,
        categoryName: category?.name || "Uncategorized",
        shopTypeId: product.shop_type_id || category?.shopTypeId,
        shopId: product.shop_id || category?.shopId,
        brandName: product.brand_name,
        price: product.product_price,
        stock: product.available_quantity,
        productQuantity: product.product_quantity,
        quantityPrefix: product.quantity_prefix,
        productWeight: product.product_weight,
        weightPrefix: product.weight_prefix,
        availableQuantity: product.available_quantity,
        description: product.product_description,
        image: mainImage?.url,
        productImages: product.product_images ?? [],
        availability: product.availability,
        isPrescriptionRequired: product.is_prescription_required,
        isRewardProduct: product.is_reward_product,
        rewardTokensRequired: product.reward_tokens_required,
        sellerId: "",
        sellerName: "Common",
        createdAt: "API",
      };
    });
  }, [commonProductsResponse, urlSellerId, visibleCategories]);

  const visibleProducts = useMemo(() => {
    const allProducts = !urlSellerId
      ? [...apiCommonProducts, ...products]
      : [
          ...apiProducts,
          ...products.filter(
            (product) => String(product.sellerId) === String(urlSellerId),
          ),
        ];

    return allProducts
      .filter((product) => !deletedProductIds.includes(product.id))
      .map((product) => ({
        ...product,
        ...(productOverrides[product.id] ?? {}),
      }));
  }, [
    apiCommonProducts,
    apiProducts,
    deletedProductIds,
    productOverrides,
    products,
    urlSellerId,
  ]);

  const productPagination = !urlSellerId
    ? {
        page: commonProductsPage,
        pageSize: COMMON_PRODUCTS_LIMIT,
        canGoPrevious: commonProductsPage > 1,
        canGoNext: apiCommonProducts.length === COMMON_PRODUCTS_LIMIT,
        onPrevious: () =>
          setCommonProductsPage((currentPage) => Math.max(1, currentPage - 1)),
        onNext: () => setCommonProductsPage((currentPage) => currentPage + 1),
      }
    : null;

  const categoryPagination = !urlSellerId
    ? {
        page: commonCategoriesPage,
        pageSize: COMMON_CATEGORIES_LIMIT,
        canGoPrevious: commonCategoriesPage > 1,
        canGoNext: apiCommonCategories.length === COMMON_CATEGORIES_LIMIT,
        onPrevious: () =>
          setCommonCategoriesPage((currentPage) =>
            Math.max(1, currentPage - 1),
          ),
        onNext: () => setCommonCategoriesPage((currentPage) => currentPage + 1),
      }
    : null;

  function handleAddShopType(newShopType) {
    setShopTypes((currentShopTypes) => [...currentShopTypes, newShopType]);
  }

  function handleUpdateShopType(updatedShopType) {
    setShopTypeOverrides((currentOverrides) => ({
      ...currentOverrides,
      [updatedShopType.id]: updatedShopType,
    }));
    setShopTypes((currentShopTypes) =>
      currentShopTypes.map((shopType) =>
        shopType.id === updatedShopType.id ? updatedShopType : shopType,
      ),
    );
  }

  function handleDeleteShopType(shopTypeId) {
    setDeletedShopTypeIds((currentIds) => [...currentIds, shopTypeId]);
    setShopTypes((currentShopTypes) =>
      currentShopTypes.filter((shopType) => shopType.id !== shopTypeId),
    );
  }

  function handleAddCategory(newCategory) {
    setCategories((currentCategories) => [...currentCategories, newCategory]);
  }

  function handleUpdateCategory(updatedCategory) {
    setCategoryOverrides((currentOverrides) => ({
      ...currentOverrides,
      [updatedCategory.id]: updatedCategory,
    }));
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category,
      ),
    );
  }

  function handleDeleteCategory(categoryId) {
    setDeletedCategoryIds((currentIds) => [...currentIds, categoryId]);
    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryId),
    );
  }

  function handleAddProduct(newProduct) {
    setProducts((currentProducts) => [...currentProducts, newProduct]);
  }

  function handleUpdateProduct(updatedProduct) {
    setProductOverrides((currentOverrides) => ({
      ...currentOverrides,
      [updatedProduct.id]: updatedProduct,
    }));
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product,
      ),
    );
  }

  function handleDeleteProduct(productId) {
    setDeletedProductIds((currentIds) => [...currentIds, productId]);
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    );
  }

  const getSellerBusinessName = () => {
    if (!urlSellerId) return "";
    return `Seller #${urlSellerId}`;
  };

  const sellerBusinessName = getSellerBusinessName();

  return (
    <div className="inventory-container">
      <div className="inventory-header-row">
        <div className="inventory-title-desc">
          <h1>Inventory Service</h1>
          <p>Manage shop types, product categories</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "32px" }}>
        <ShopTypeSection
          shopTypes={visibleShopTypes}
          onAddShopType={handleAddShopType}
          onUpdateShopType={handleUpdateShopType}
          onDeleteShopType={handleDeleteShopType}
          activeSellerId={urlSellerId}
          isLoading={isShopTypesLoading}
          isError={isShopTypesError}
        />

        <CategorySection
          categories={visibleCategories}
          shopTypes={visibleShopTypes}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          activeSellerId={urlSellerId}
          isLoading={
            urlSellerId ? isSellerCategoriesLoading : isCommonCategoriesLoading
          }
          isError={
            urlSellerId ? isSellerCategoriesError : isCommonCategoriesError
          }
          pagination={categoryPagination}
        />

        <ProductSection
          products={visibleProducts}
          categories={visibleCategories}
          shopTypes={visibleShopTypes}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          userRole={urlSellerId ? "seller" : activeRole}
          currentUserId={urlSellerId || currentUserId}
          currentUserName={urlSellerId ? sellerBusinessName : currentUserName}
          activeSellerId={urlSellerId}
          isLoading={
            urlSellerId ? isSellerProductsLoading : isCommonProductsLoading
          }
          isError={urlSellerId ? isSellerProductsError : isCommonProductsError}
          pagination={productPagination}
        />
      </div>
    </div>
  );
}
