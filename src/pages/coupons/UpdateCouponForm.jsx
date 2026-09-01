import { useForm, useWatch } from "react-hook-form";
import Portal from "../../utils/portal";
import styles from "./Coupons.module.css";

const COUPON_TYPES = ["fixed", "percentage"];
const BOOLEAN_OPTIONS = [
  { label: "True", value: "true" },
  { label: "False", value: "false" },
];

const nullableNumber = (value) =>
  value === "" || value === null || value === undefined ? null : Number(value);
const nullableInteger = (value) =>
  value === "" || value === null || value === undefined
    ? null
    : Number.parseInt(value, 10);
const nullableDate = (value) => (value ? value : null);
const dateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

function UpdateCouponForm({ coupon, error, isSubmitting, onClose, onSubmit }) {
  const {
    formState: { errors, dirtyFields },
    handleSubmit,
    register,
    control,
  } = useForm({
    defaultValues: {
      code: coupon.code || "",
      type: coupon.type || "fixed",
      value: coupon.value ?? "",
      min_order_value: coupon.min_order_value ?? "",
      max_discount: coupon.max_discount ?? "",
      start_date: dateInputValue(coupon.start_date),
      end_date: dateInputValue(coupon.end_date),
      usage_limit: coupon.usage_limit ?? "",
      is_first_order: String(Boolean(coupon.is_first_order)),
    },
    mode: "onChange",
  });
  const selectedType = useWatch({
    control,
    name: "type",
  });
  const startDate = useWatch({
    control,
    name: "start_date",
  });
  const hasChanges = Object.keys(dirtyFields).length > 0;
  const hasErrors = Object.keys(errors).length > 0;

  const handleUpdateCoupon = (formData) => {
    const payload = {};

    if (dirtyFields.code) payload.code = formData.code.trim();
    if (dirtyFields.type) payload.type = formData.type;
    if (dirtyFields.value) payload.value = nullableNumber(formData.value);
    if (dirtyFields.min_order_value) {
      payload.min_order_value = nullableNumber(formData.min_order_value);
    }
    if (dirtyFields.max_discount) {
      payload.max_discount = nullableNumber(formData.max_discount);
    }
    if (dirtyFields.start_date) {
      payload.start_date = nullableDate(formData.start_date);
    }
    if (dirtyFields.end_date) {
      payload.end_date = nullableDate(formData.end_date);
    }
    if (dirtyFields.usage_limit) {
      payload.usage_limit = nullableInteger(formData.usage_limit);
    }
    if (dirtyFields.is_first_order) {
      payload.is_first_order = formData.is_first_order === "true";
    }

    if (Object.keys(payload).length === 0) return;

    onSubmit(payload);
  };

  return (
    <Portal>
      <div
        className={styles.modalOverlay}
        role="presentation"
        onMouseDown={onClose}
      >
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-coupon-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2 id="update-coupon-title">Update Coupon</h2>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close update coupon"
              onClick={onClose}
              disabled={isSubmitting}
            >
              x
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(handleUpdateCoupon)}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Coupon Code</span>
                <input
                  type="text"
                  aria-invalid={errors.code ? "true" : "false"}
                  {...register("code")}
                />
                {errors.code ? <small>{errors.code.message}</small> : null}
              </label>

              <label className={styles.field}>
                <span>Type</span>
                <select
                  aria-invalid={errors.type ? "true" : "false"}
                  {...register("type")}
                >
                  {COUPON_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type ? <small>{errors.type.message}</small> : null}
              </label>

              <label className={styles.field}>
                <span>Value</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  aria-invalid={errors.value ? "true" : "false"}
                  {...register("value", {
                    validate: (value) => {
                      if (value === "") return true;

                      const numberValue = Number(value);
                      if (Number.isNaN(numberValue)) {
                        return "Value must be a number";
                      }
                      if (numberValue < 0) {
                        return "Value must be a number greater than or equal to 0";
                      }
                      if (selectedType === "percentage" && numberValue > 100) {
                        return "Percentage value cannot be more than 100";
                      }

                      return true;
                    },
                  })}
                />
                {errors.value ? <small>{errors.value.message}</small> : null}
              </label>

              <label className={styles.field}>
                <span>Min Order Value</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  aria-invalid={errors.min_order_value ? "true" : "false"}
                  {...register("min_order_value", {
                    validate: (value) => {
                      if (value === "") return true;

                      if (Number.isNaN(Number(value))) {
                        return "Minimum order value must be a number";
                      }

                      return (
                        Number(value) >= 0 ||
                        "Minimum order value must be greater than or equal to 0"
                      );
                    },
                  })}
                />
                {errors.min_order_value ? (
                  <small>{errors.min_order_value.message}</small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>Max Discount</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  aria-invalid={errors.max_discount ? "true" : "false"}
                  {...register("max_discount", {
                    validate: (value) => {
                      if (value === "") return true;

                      if (Number.isNaN(Number(value))) {
                        return "Max discount must be a number";
                      }

                      return (
                        Number(value) >= 0 ||
                        "Max discount must be greater than or equal to 0"
                      );
                    },
                  })}
                />
                {errors.max_discount ? (
                  <small>{errors.max_discount.message}</small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>Usage Limit</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  aria-invalid={errors.usage_limit ? "true" : "false"}
                  {...register("usage_limit", {
                    validate: (value) => {
                      if (value === "") return true;

                      const usageLimit = Number(value);
                      if (!Number.isInteger(usageLimit)) {
                        return "Usage limit must be a whole number";
                      }

                      return (
                        usageLimit >= 0 ||
                        "Usage limit must be greater than or equal to 0"
                      );
                    },
                  })}
                />
                {errors.usage_limit ? (
                  <small>{errors.usage_limit.message}</small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>Start Date</span>
                <input type="date" {...register("start_date")} />
              </label>

              <label className={styles.field}>
                <span>End Date</span>
                <input
                  type="date"
                  aria-invalid={errors.end_date ? "true" : "false"}
                  {...register("end_date", {
                    validate: (value) =>
                      !value ||
                      !startDate ||
                      value >= startDate ||
                      "End date cannot be before start date",
                  })}
                />
                {errors.end_date ? (
                  <small>{errors.end_date.message}</small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>First Order</span>
                <select {...register("is_first_order")}>
                  {BOOLEAN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error ? <p className={styles.formError}>{error}</p> : null}

            <div className={styles.footer}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!hasChanges || hasErrors || isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Coupon"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

export default UpdateCouponForm;
