import { useForm, useWatch } from "react-hook-form";
import Portal from "../utils/portal";
import styles from "./Coupons.module.css";

const COUPON_TYPES = ["fixed", "percentage"];
const BOOLEAN_OPTIONS = [
  { label: "True", value: "true" },
  { label: "False", value: "false" },
];

const optionalNumber = (value) =>
  value === "" || value === null || value === undefined ? undefined : Number(value);
const optionalInteger = (value) =>
  value === "" || value === null || value === undefined
    ? undefined
    : Number.parseInt(value, 10);
const optionalDate = (value) => (value ? value : undefined);

function CreateCouponForm({ error, isSubmitting, onClose, onSubmit }) {
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    control,
  } = useForm({
    defaultValues: {
      code: "",
      type: "fixed",
      value: "",
      min_order_value: "",
      max_discount: "",
      start_date: "",
      end_date: "",
      usage_limit: "",
      is_active: "true",
      is_first_order: "false",
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

  const handleCreateCoupon = (formData) => {
    const payload = {
      code: formData.code.trim(),
      type: formData.type,
      value: Number(formData.value),
      min_order_value: optionalNumber(formData.min_order_value),
      max_discount: optionalNumber(formData.max_discount),
      start_date: optionalDate(formData.start_date),
      end_date: optionalDate(formData.end_date),
      usage_limit: optionalInteger(formData.usage_limit),
      is_active: formData.is_active === "true",
      is_first_order: formData.is_first_order === "true",
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

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
          aria-labelledby="create-coupon-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2 id="create-coupon-title">Create Coupon</h2>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close create coupon"
              onClick={onClose}
              disabled={isSubmitting}
            >
              x
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(handleCreateCoupon)}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>
                  Coupon Code <b aria-hidden="true">*</b>
                </span>
                <input
                  type="text"
                  aria-invalid={errors.code ? "true" : "false"}
                  {...register("code", {
                    required: "Coupon code is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Coupon code is required",
                  })}
                />
                {errors.code ? <small>{errors.code.message}</small> : null}
              </label>

              <label className={styles.field}>
                <span>
                  Type <b aria-hidden="true">*</b>
                </span>
                <select
                  aria-invalid={errors.type ? "true" : "false"}
                  {...register("type", {
                    required: "Type is required",
                  })}
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
                <span>
                  Value <b aria-hidden="true">*</b>
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  aria-invalid={errors.value ? "true" : "false"}
                  {...register("value", {
                    required: "Value is required",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Value must be a number greater than or equal to 0",
                    },
                    validate: (value) => {
                      if (Number.isNaN(value)) return "Value is required";
                      if (selectedType === "percentage" && value > 100) {
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
                    min: {
                      value: 0,
                      message:
                        "Minimum order value must be greater than or equal to 0",
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
                    min: {
                      value: 0,
                      message: "Max discount must be greater than or equal to 0",
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
                <span>Active</span>
                <select {...register("is_active")}>
                  {BOOLEAN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

export default CreateCouponForm;
