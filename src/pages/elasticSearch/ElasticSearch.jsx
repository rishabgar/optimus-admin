import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable from "../../components/DataTable/DataTable";
import {
  clearIndexedProducts,
  deleteIndexedProduct,
  getIndexedProducts,
} from "../../services/api/elasticSearch";
import Portal from "../../utils/portal";
import styles from "./ElasticSearch.module.css";

const SIX_HOURS = 6 * 60 * 60 * 1000;

function ElasticSearch() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const {
    data: indexedProductsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["indexedProducts", page],
    queryFn: () => getIndexedProducts(page),
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const products = indexedProductsData?.data ?? [];
  const total = indexedProductsData?.total ?? 0;
  const currentPage = indexedProductsData?.page ?? page;
  const totalPages = indexedProductsData?.totalPages ?? 1;
  const hasMore = Boolean(indexedProductsData?.hasMore);

  const deleteProductMutation = useMutation({
    mutationFn: deleteIndexedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indexedProducts"] });
    },
  });
  const deleteProductError =
    deleteProductMutation.error?.response?.data?.message ||
    deleteProductMutation.error?.message ||
    "Unable to delete product.";
  const clearDataMutation = useMutation({
    mutationFn: clearIndexedProducts,
    onSuccess: () => {
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["indexedProducts"] });
    },
  });
  const clearDataError =
    clearDataMutation.error?.response?.data?.message ||
    clearDataMutation.error?.message ||
    "Unable to clear indexed products.";

  const productColumns = [
    {
      key: "product_id",
      header: "Product ID",
      cellClassName: styles.idCell,
      render: (product) => product.product_id || "-",
    },
    {
      key: "product_name",
      header: "Product Name",
      render: (product) => product.product_name || "-",
    },
    {
      key: "brand_name",
      header: "Brand Name",
      render: (product) => product.brand_name || "-",
    },
    {
      key: "product_description",
      header: "Description",
      cellClassName: styles.descriptionCell,
      render: (product) => product.product_description || "-",
    },
    {
      key: "product_category_name",
      header: "Category",
      render: (product) => product.product_category_name || "-",
    },
    {
      key: "shop_name",
      header: "Shop",
      render: (product) => product.shop_name || "-",
    },
    {
      key: "shop_id",
      header: "Shop ID",
      cellClassName: styles.idCell,
      render: (product) => product.shop_id || "-",
    },
    {
      key: "shop_type_name",
      header: "Shop Type",
      render: (product) => product.shop_type_name || "-",
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
  ];

  return (
    <section className={styles.elasticSearch}>
      <div className={styles.header}>
        <h1>Elastic Search</h1>
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => {
            if (clearDataMutation.isPending) return;
            if (!window.confirm("Clear all indexed product data?")) return;

            clearDataMutation.mutate();
          }}
          disabled={clearDataMutation.isPending}
        >
          {clearDataMutation.isPending ? "Clearing..." : "Clear Data"}
        </button>
      </div>

      <DataTable
        columns={productColumns}
        data={products}
        getRowKey={(product) => product.id || product.product_id}
        isLoading={isLoading || clearDataMutation.isPending}
        loadingMessage={
          clearDataMutation.isPending
            ? "Clearing indexed products..."
            : "Loading indexed products..."
        }
        isError={isError}
        errorMessage={error?.message || "Unable to load indexed products."}
        emptyMessage="No indexed products found."
        minWidth={1680}
        rowActions={[
          {
            label: "View more",
            onClick: (product) => setSelectedProduct(product),
          },
          {
            label: "Delete product",
            onClick: (product) => {
              const productId = product.product_id || product.id;

              if (!productId || deleteProductMutation.isPending) return;
              if (!window.confirm("Delete this product?")) return;

              deleteProductMutation.mutate(productId);
            },
          },
        ]}
      />

      {deleteProductMutation.isError ? (
        <p className={styles.formError}>{deleteProductError}</p>
      ) : null}

      {clearDataMutation.isError ? (
        <p className={styles.formError}>{clearDataError}</p>
      ) : null}

      {total > 0 ? (
        <div className={styles.pagination}>
          <span>
            Page {currentPage} of {totalPages} | Showing {products.length} of{" "}
            {total} indexed products
          </span>
          <div className={styles.paginationButtons}>
            <button
              type="button"
              onClick={() => setPage((pageNumber) => Math.max(pageNumber - 1, 1))}
              disabled={currentPage <= 1 || isLoading}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((pageNumber) => Math.min(pageNumber + 1, totalPages))
              }
              disabled={!hasMore || currentPage >= totalPages || isLoading}
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
            onMouseDown={() => setSelectedProduct(null)}
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="indexed-product-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 id="indexed-product-title">Variant Details</h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close variant details"
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
                      <th>SKU</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedProduct.variants ?? []).length > 0 ? (
                      selectedProduct.variants.map((variant) => (
                        <tr key={variant.sku || variant.label}>
                          <td>{variant.label || "-"}</td>
                          <td>{variant.sku || "-"}</td>
                          <td>{variant.price ?? "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className={styles.statusCell}>
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
    </section>
  );
}

export default ElasticSearch;
