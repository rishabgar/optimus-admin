import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable from "../../components/DataTable/DataTable";
import {
  createRewardProduct,
  getRewardProducts,
} from "../../services/api/rewardProducts";
import Portal from "../../utils/portal";
import CreateRewardProductForm from "./CreateRewardProductForm";
import styles from "./reward.module.css";

const SIX_HOURS = 6 * 60 * 60 * 1000;

function Reward() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreateRewardOpen, setIsCreateRewardOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    data: rewardProductsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rewardProducts", page],
    queryFn: () => getRewardProducts(page),
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const products = rewardProductsData?.products ?? [];
  const totalProducts =
    rewardProductsData?.totalProducts ?? rewardProductsData?.total_product ?? 0;
  const totalPages = rewardProductsData?.totalPages ?? 1;
  const currentPage = rewardProductsData?.page_no ?? page;

  const createRewardMutation = useMutation({
    mutationFn: createRewardProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewardProducts"] });
    },
  });

  const createRewardError =
    createRewardMutation.error?.response?.data?.message ||
    createRewardMutation.error?.message ||
    "Unable to create reward product.";
  const createRewardSuccess =
    createRewardMutation.data?.message ||
    "Reward product created successfully.";
  const rewardColumns = [
    {
      key: "product_name",
      header: "Product Name",
      render: (product) => product.product_name || "-",
    },
    {
      key: "product_images",
      header: "Product Image",
      render: (product) => {
        const productImage = product.product_images?.[0];

        return productImage?.url ? (
          <img
            className={styles.productImage}
            src={productImage.url}
            alt={productImage.alt || product.product_name || "Reward product"}
          />
        ) : (
          "-"
        );
      },
    },
    {
      key: "product_description",
      header: "Product Description",
      cellClassName: styles.descriptionCell,
      render: (product) => product.product_description || "-",
    },
    {
      key: "brand_name",
      header: "Brand Name",
      render: (product) => product.brand_name || "-",
    },
  ];

  return (
    <section className={styles.reward}>
      <div className={styles.header}>
        <h1>Reward</h1>
        <button
          type="button"
          className={styles.createButton}
          onClick={() => setIsCreateRewardOpen(true)}
        >
          <span aria-hidden="true">+</span>
          Create Reward Product
        </button>
      </div>

      <DataTable
        columns={rewardColumns}
        data={products}
        getRowKey={(product) => product._id || product.product_name}
        isLoading={isLoading}
        loadingMessage="Loading reward products..."
        isError={isError}
        errorMessage={error?.message || "Unable to load reward products."}
        emptyMessage="No reward products found."
        minWidth={980}
        rowActions={[
          {
            label: "View more",
            onClick: (product) => setSelectedProduct(product),
          },
        ]}
      />

      {totalProducts > 0 ? (
        <div className={styles.pagination}>
          <span>
            Page {currentPage} of {totalPages} | Showing {products.length} of{" "}
            {totalProducts} reward products
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
              disabled={currentPage >= totalPages || isLoading}
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
              aria-labelledby="reward-variants-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 id="reward-variants-title">Variants</h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close reward variants"
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
                      <th>Weight In Grams</th>
                      <th>SKU</th>
                      <th>MRP</th>
                      <th>Reward Tokens</th>
                      <th>Product Quantity</th>
                      <th>Available Quantity</th>
                      <th>Reserved Quantity</th>
                      <th>Default</th>
                      <th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedProduct.variants ?? []).length > 0 ? (
                      selectedProduct.variants.map((variant) => (
                        <tr key={variant.sku || variant.label}>
                          <td>{variant.label || "-"}</td>
                          <td>{variant.weight_value ?? "-"}</td>
                          <td>{variant.weight_unit || "-"}</td>
                          <td>{variant.weight_in_grams ?? "-"}</td>
                          <td>{variant.sku || "-"}</td>
                          <td>{variant.mrp ?? "-"}</td>
                          <td>{variant.reward_tokens_required ?? "-"}</td>
                          <td>{variant.product_quantity ?? "-"}</td>
                          <td>{variant.available_quantity ?? "-"}</td>
                          <td>{variant.reserved_quantity ?? "-"}</td>
                          <td>{variant.is_default ? "Yes" : "No"}</td>
                          <td>{variant.is_active ? "Active" : "Inactive"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className={styles.statusCell}>
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

      {isCreateRewardOpen ? (
        <Portal>
          <div className={styles.modalOverlay} role="presentation">
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-reward-product-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 id="create-reward-product-title">
                  Create Reward Product
                </h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close create reward product"
                  onClick={() => setIsCreateRewardOpen(false)}
                >
                  x
                </button>
              </div>

              <CreateRewardProductForm
                isSubmitting={createRewardMutation.isPending}
                onSubmit={(payload) => createRewardMutation.mutate(payload)}
              />

              {createRewardMutation.isError ? (
                <p className={styles.formError}>{createRewardError}</p>
              ) : null}

              {createRewardMutation.isSuccess ? (
                <p className={styles.formSuccess}>{createRewardSuccess}</p>
              ) : null}
            </div>
          </div>
        </Portal>
      ) : null}
    </section>
  );
}

export default Reward;
