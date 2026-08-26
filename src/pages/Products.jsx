import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CreateProductForm from "../components/CreateProductForm/CreateProductForm";
import DataTable from "../components/DataTable/DataTable";
import {
  createProduct,
  getAdminProductsByCategory,
  getProductsByShop,
} from "../services/api/products";
import { getCategoriesByShopType } from "../services/api/categories";
import { getShopsByType, getShopTypes } from "../services/api/shops";
import Portal from "../utils/portal";
import styles from "./Products.module.css";

const SIX_HOURS = 6 * 60 * 60 * 1000;
const PRODUCT_TABS = {
  SELLER: "seller",
  ADMIN: "admin",
};

function Products() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(PRODUCT_TABS.SELLER);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedShopTypeId, setSelectedShopTypeId] = useState("");
  const [selectedProductCategoryId, setSelectedProductCategoryId] =
    useState("");
  const [sellerPage, setSellerPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

  const {
    data: shopTypes = [],
    isLoading: isShopTypesLoading,
    isError: isShopTypesError,
  } = useQuery({
    queryKey: ["shopTypes"],
    queryFn: getShopTypes,
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const effectiveShopTypeId =
    selectedShopTypeId || shopTypes[0]?.shop_type_id || shopTypes[0]?._id || "";

  const {
    data: shops = [],
    isLoading: isShopsLoading,
    isError: isShopsError,
  } = useQuery({
    queryKey: ["shops", effectiveShopTypeId],
    queryFn: () => getShopsByType(effectiveShopTypeId),
    enabled: Boolean(effectiveShopTypeId),
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const {
    data: productCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["productCategories", effectiveShopTypeId],
    queryFn: () => getCategoriesByShopType(effectiveShopTypeId),
    enabled: activeTab === PRODUCT_TABS.ADMIN && Boolean(effectiveShopTypeId),
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const effectiveProductCategoryId = productCategories.some(
    (category) => category.product_category_id === selectedProductCategoryId,
  )
    ? selectedProductCategoryId
    : productCategories[0]?.product_category_id || "";


  const {
    data: productData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: ["shopProducts", selectedShopId, sellerPage],
    queryFn: () => getProductsByShop(selectedShopId, sellerPage),
    enabled: activeTab === PRODUCT_TABS.SELLER && Boolean(selectedShopId),
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const {
    data: adminProductData,
    isLoading: isAdminProductsLoading,
    isError: isAdminProductsError,
    error: adminProductsError,
  } = useQuery({
    queryKey: ["adminProducts", effectiveProductCategoryId, adminPage],
    queryFn: () =>
      getAdminProductsByCategory(effectiveProductCategoryId, adminPage),
    enabled:
      activeTab === PRODUCT_TABS.ADMIN && Boolean(effectiveProductCategoryId),
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const isSellerTab = activeTab === PRODUCT_TABS.SELLER;
  const activeProductData = isSellerTab ? productData : adminProductData;
  const products = activeProductData?.products ?? [];
  const totalPages = activeProductData?.totalPages ?? 1;
  const totalProducts = activeProductData?.totalProducts ?? 0;
  const currentPage = isSellerTab ? sellerPage : adminPage;
  const isTableLoading = isSellerTab
    ? Boolean(selectedShopId) && isProductsLoading
    : Boolean(effectiveProductCategoryId) && isAdminProductsLoading;
  const isTableError = isSellerTab
    ? Boolean(selectedShopId) && isProductsError
    : Boolean(effectiveProductCategoryId) && isAdminProductsError;
  const tableErrorMessage = isSellerTab
    ? productsError?.message || "Unable to load products."
    : adminProductsError?.message || "Unable to load admin products.";
  const tableIdleMessage = isSellerTab
    ? !selectedShopId
      ? "Select a shop to view products."
      : ""
    : !effectiveProductCategoryId
      ? "Select a category to view admin products."
      : "";
  const setCurrentPage = isSellerTab ? setSellerPage : setAdminPage;

  const productColumns = [
    {
      key: "product_name",
      header: "Product Name",
      render: (product) => product.product_name || "-",
    },
    {
      key: "product_description",
      header: "Description",
      cellClassName: styles.descriptionCell,
      render: (product) => product.product_description || "-",
    },
    {
      key: "product_images",
      header: "Images",
      render: (product) => {
        const productImages = product.product_images ?? [];

        return productImages.length > 0 ? (
          <div className={styles.productImages}>
            {productImages.map((image, index) => (
              <img
                key={`${image.url}-${index}`}
                src={image.url}
                alt={image.alt || product.product_name || "Product"}
              />
            ))}
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      key: "brand_name",
      header: "Brand Name",
      render: (product) => product.brand_name || "-",
    },
  ];

  const getProductId = (product) => product.product_id || product._id;
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
  });

  const createProductError =
    createProductMutation.error?.response?.data?.message ||
    createProductMutation.error?.message ||
    "Unable to create product.";
  const createProductSuccess =
    createProductMutation.data?.message || "Product created successfully.";

  return (
    <section className={styles.products}>
      <div className={styles.header}>
        <div className={styles.titleBar}>
          <h1>Products</h1>
          <button
            type="button"
            className={styles.createButton}
            onClick={() => setIsCreateProductOpen(true)}
          >
            <span aria-hidden="true">+</span>
            Create Product
          </button>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Product views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === PRODUCT_TABS.SELLER}
            className={
              activeTab === PRODUCT_TABS.SELLER
                ? `${styles.tabButton} ${styles.activeTab}`
                : styles.tabButton
            }
            onClick={() => setActiveTab(PRODUCT_TABS.SELLER)}
          >
            Seller product
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === PRODUCT_TABS.ADMIN}
            className={
              activeTab === PRODUCT_TABS.ADMIN
                ? `${styles.tabButton} ${styles.activeTab}`
                : styles.tabButton
            }
            onClick={() => setActiveTab(PRODUCT_TABS.ADMIN)}
          >
            Admin products
          </button>
        </div>
        <div className={styles.filters}>
          <label className={styles.selectField}>
            <span className={styles.srOnly}>Shop Type</span>
            <select
              value={effectiveShopTypeId}
              onChange={(event) => {
                setSelectedShopTypeId(event.target.value);
                setSelectedShopId("");
                setSelectedProductCategoryId("");
                setSellerPage(1);
                setAdminPage(1);
              }}
              disabled={
                isShopTypesLoading || isShopTypesError || shopTypes.length === 0
              }
            >
              <option value="">
                {isShopTypesLoading
                  ? "Loading shop types..."
                  : isShopTypesError
                    ? "Unable to load shop types"
                    : "Select shop type"}
              </option>

              {shopTypes.map((shopType) => (
                <option
                  key={shopType.shop_type_id || shopType._id}
                  value={shopType.shop_type_id || shopType._id}
                >
                  {shopType.shop_type_name}
                </option>
              ))}
            </select>
          </label>

          {isSellerTab ? (
            <label className={styles.selectField}>
              <span className={styles.srOnly}>Shop</span>
              <select
                value={selectedShopId}
                onChange={(event) => {
                  setSelectedShopId(event.target.value);
                  setSellerPage(1);
                }}
                disabled={
                  !effectiveShopTypeId ||
                  isShopsLoading ||
                  isShopsError ||
                  shops.length === 0
                }
              >
                <option value="">
                  {isShopsLoading
                    ? "Loading shops..."
                    : isShopsError
                      ? "Unable to load shops"
                      : "Select shop"}
                </option>

                {shops.map((shop) => (
                  <option key={shop.shop_id} value={shop.shop_id}>
                    {shop.shop_name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className={styles.selectField}>
              <span className={styles.srOnly}>Product Category</span>
              <select
                value={effectiveProductCategoryId}
                onChange={(event) => {
                  setSelectedProductCategoryId(event.target.value);
                  setAdminPage(1);
                }}
                disabled={
                  !effectiveShopTypeId ||
                  isCategoriesLoading ||
                  isCategoriesError ||
                  productCategories.length === 0
                }
              >
                <option value="">
                  {isCategoriesLoading
                    ? "Loading categories..."
                    : isCategoriesError
                      ? "Unable to load categories"
                      : "Select category"}
                </option>

                {productCategories.map((category) => (
                  <option
                    key={category.product_category_id}
                    value={category.product_category_id}
                  >
                    {category.product_category_name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      <DataTable
        columns={productColumns}
        data={products}
        getRowKey={getProductId}
        idleMessage={tableIdleMessage}
        isLoading={isTableLoading}
        loadingMessage="Loading products..."
        isError={isTableError}
        errorMessage={tableErrorMessage}
        emptyMessage="No products found."
        minWidth={940}
        rowActions={[
          {
            label: "View variants",
            onClick: (product) => setSelectedProduct(product),
          },
        ]}
      />

      {(isSellerTab ? selectedShopId : effectiveProductCategoryId) &&
      totalProducts > 0 ? (
        <div className={styles.pagination}>
          <span>
            Page {activeProductData?.page ?? activeProductData?.page_no ?? currentPage} of{" "}
            {totalPages}
          </span>
          <div className={styles.paginationButtons}>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage <= 1 || isTableLoading}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage >= totalPages || isTableLoading}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {selectedProduct ? (
        <Portal>
          <div
            className={styles.modalOverlay}
            role="presentation"
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="variants-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 id="variants-title">Variants</h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close variants"
                  onClick={() => setSelectedProduct(null)}
                >
                  x
                </button>
              </div>

              <div className={styles.variantTableWrap}>
                <table className={styles.variantTable}>
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Weight Value</th>
                      <th>Weight Unit</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Discount %</th>
                      <th>Product Quantity</th>
                      <th>Available Quantity</th>
                      <th>Reserved Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedProduct.variants ?? []).length > 0 ? (
                      selectedProduct.variants.map((variant) => (
                        <tr key={variant.sku || variant.label}>
                          <td>{variant.label || "-"}</td>
                          <td>{variant.weight_value ?? "-"}</td>
                          <td>{variant.weight_unit || "-"}</td>
                          <td>{variant.sku || "-"}</td>
                          <td>{variant.price ?? "-"}</td>
                          <td>{variant.discount_percent ?? "-"}</td>
                          <td>{variant.product_quantity ?? "-"}</td>
                          <td>{variant.available_quantity ?? "-"}</td>
                          <td>{variant.reserved_quantity ?? "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className={styles.statusCell}>
                          No variants found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}

      {isCreateProductOpen ? (
        <Portal>
          <div
            className={styles.modalOverlay}
            role="presentation"
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-product-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 id="create-product-title">Create Product</h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close create product"
                  onClick={() => setIsCreateProductOpen(false)}
                >
                  x
                </button>
              </div>

              <CreateProductForm
                key={effectiveShopTypeId}
                defaultShopTypeId={effectiveShopTypeId}
                shopTypes={shopTypes}
                isSubmitting={createProductMutation.isPending}
                onSubmit={(payload) => createProductMutation.mutate(payload)}
              />

              {createProductMutation.isError ? (
                <p className={styles.formError}>{createProductError}</p>
              ) : null}

              {createProductMutation.isSuccess ? (
                <p className={styles.formSuccess}>{createProductSuccess}</p>
              ) : null}
            </div>
          </div>
        </Portal>
      ) : null}
    </section>
  );
}

export default Products;
