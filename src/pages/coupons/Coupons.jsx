import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable from "../../components/DataTable/DataTable";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "../../services/api/coupons";
import CreateCouponForm from "./CreateCouponForm";
import UpdateCouponForm from "./UpdateCouponForm";
import styles from "./Coupons.module.css";

const SIX_HOURS = 6 * 60 * 60 * 1000;

const renderCurrency = (value) =>
  value === null || value === undefined ? "-" : value;

const renderBooleanBadge = (value, trueLabel, falseLabel) => (
  <span className={value ? styles.activeBadge : styles.inactiveBadge}>
    {value ? trueLabel : falseLabel}
  </span>
);

function Coupons() {
  const queryClient = useQueryClient();
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const {
    data: coupons = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["coupons"],
    queryFn: getCoupons,
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const createCouponMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setIsCreateCouponOpen(false);
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: updateCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setSelectedCoupon(null);
    },
  });

  const couponActionMutation = useMutation({
    mutationFn: updateCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  const createCouponError =
    createCouponMutation.error?.response?.data?.message ||
    createCouponMutation.error?.message ||
    "Unable to create coupon.";
  const deleteCouponError =
    deleteCouponMutation.error?.response?.data?.message ||
    deleteCouponMutation.error?.message ||
    "Unable to delete coupon.";
  const updateCouponError =
    updateCouponMutation.error?.response?.data?.message ||
    updateCouponMutation.error?.message ||
    "Unable to update coupon.";
  const couponActionError =
    couponActionMutation.error?.response?.data?.message ||
    couponActionMutation.error?.message ||
    "Unable to update coupon.";

  const couponColumns = [
    {
      key: "code",
      header: "Code",
      render: (coupon) => coupon.code || "-",
    },
    {
      key: "type",
      header: "Type",
      render: (coupon) => coupon.type || "-",
    },
    {
      key: "value",
      header: "Value",
      render: (coupon) => renderCurrency(coupon.value),
    },
    {
      key: "min_order_value",
      header: "Min Order Value",
      render: (coupon) => renderCurrency(coupon.min_order_value),
    },
    {
      key: "usage_limit",
      header: "Usage Limit",
      render: (coupon) => coupon.usage_limit ?? "-",
    },
    {
      key: "used_count",
      header: "Used Count",
      render: (coupon) => coupon.used_count ?? "-",
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (coupon) =>
        coupon.start_date ? String(coupon.start_date).slice(0, 10) : "-",
    },
    {
      key: "end_date",
      header: "End Date",
      render: (coupon) =>
        coupon.end_date ? String(coupon.end_date).slice(0, 10) : "-",
    },
    {
      key: "is_active",
      header: "Active",
      render: (coupon) =>
        renderBooleanBadge(coupon.is_active, "Active", "Inactive"),
    },
    {
      key: "is_first_order",
      header: "First Order",
      render: (coupon) =>
        renderBooleanBadge(coupon.is_first_order, "Yes", "No"),
    },
    {
      key: "is_Expired",
      header: "Expired",
      render: (coupon) => (
        <span
          className={
            coupon.is_Expired ? styles.inactiveBadge : styles.activeBadge
          }
        >
          {coupon.is_Expired ? "Expired" : "Valid"}
        </span>
      ),
    },
    {
      key: "is_deleted",
      header: "Deleted",
      render: (coupon) => (
        <span
          className={coupon.is_deleted ? styles.inactiveBadge : styles.activeBadge}
        >
          {coupon.is_deleted ? "Deleted" : "Not Deleted"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: styles.actionsCell,
      render: (coupon) => {
        const code = coupon.code || "";
        const isDeleting =
          deleteCouponMutation.isPending &&
          deleteCouponMutation.variables === code;
        const isUpdatingAction =
          couponActionMutation.isPending &&
          couponActionMutation.variables?.code === code;
        const isDeleted = Boolean(coupon.is_deleted);

        return (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={`Edit coupon ${code || "without code"}`}
              onClick={() => {
                setSelectedCoupon(coupon);
                updateCouponMutation.reset();
              }}
              disabled={!code}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 17.25V20h2.75L17.8 8.95 15.05 6.2 4 17.25Zm15.92-10.43a1 1 0 0 0 0-1.42L18.6 4.08a1 1 0 0 0-1.42 0l-1.06 1.06 2.74 2.74 1.06-1.06Z" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={`${coupon.is_active ? "Inactivate" : "Activate"} coupon ${code || "without code"}`}
              onClick={() => {
                if (!code || isDeleted || isUpdatingAction) return;

                couponActionMutation.mutate({
                  code,
                  couponData: { is_active: !coupon.is_active },
                });
              }}
              disabled={!code || isDeleted || isUpdatingAction}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={`Restore coupon ${code || "without code"}`}
              onClick={() => {
                if (!code || !isDeleted || isUpdatingAction) return;

                couponActionMutation.mutate({
                  code,
                  couponData: { is_deleted: false },
                });
              }}
              disabled={!code || !isDeleted || isUpdatingAction}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5a7 7 0 1 1-6.32 4H3l4-4 4 4H7.9A5 5 0 1 0 12 7V5Z" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.deleteButton}`}
              aria-label={`Delete coupon ${code || "without code"}`}
              onClick={() => {
                if (!code || isDeleting) return;

                deleteCouponMutation.mutate(code);
              }}
              disabled={!code || isDeleting}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 21a2 2 0 0 1-2-2V8h14v11a2 2 0 0 1-2 2H7ZM9 4h6l1 2h4v2H4V6h4l1-2Zm0 7v7h2v-7H9Zm4 0v7h2v-7h-2Z" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];

  const handleCloseCreateCoupon = () => {
    if (createCouponMutation.isPending) return;

    createCouponMutation.reset();
    setIsCreateCouponOpen(false);
  };

  const handleCreateCoupon = (payload) => {
    createCouponMutation.mutate(payload);
  };

  const handleCloseUpdateCoupon = () => {
    if (updateCouponMutation.isPending) return;

    setSelectedCoupon(null);
    updateCouponMutation.reset();
  };

  const handleUpdateCoupon = (payload) => {
    if (!selectedCoupon?.code) return;

    updateCouponMutation.mutate({
      code: selectedCoupon.code,
      couponData: payload,
    });
  };

  return (
    <section className={styles.coupons}>
      <div className={styles.header}>
        <h1>Coupons</h1>
        <button
          type="button"
          className={styles.createButton}
          onClick={() => setIsCreateCouponOpen(true)}
        >
          <span aria-hidden="true">+</span>
          Create Coupon
        </button>
      </div>

      <DataTable
        columns={couponColumns}
        data={coupons}
        getRowKey={(coupon) => coupon._id || coupon.code}
        isLoading={isLoading}
        loadingMessage="Loading coupons..."
        isError={isError}
        errorMessage={error?.message || "Unable to load coupons."}
        emptyMessage="No coupons found."
        minWidth={1480}
      />

      {deleteCouponMutation.isError ? (
        <p className={styles.formError}>{deleteCouponError}</p>
      ) : null}

      {couponActionMutation.isError ? (
        <p className={styles.formError}>{couponActionError}</p>
      ) : null}

      {selectedCoupon ? (
        <UpdateCouponForm
          coupon={selectedCoupon}
          error={updateCouponMutation.isError ? updateCouponError : ""}
          isSubmitting={updateCouponMutation.isPending}
          onClose={handleCloseUpdateCoupon}
          onSubmit={handleUpdateCoupon}
        />
      ) : null}

      {isCreateCouponOpen ? (
        <CreateCouponForm
          error={createCouponMutation.isError ? createCouponError : ""}
          isSubmitting={createCouponMutation.isPending}
          onClose={handleCloseCreateCoupon}
          onSubmit={handleCreateCoupon}
        />
      ) : null}
    </section>
  );
}

export default Coupons;
