import { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { getCategoriesByShopType } from "../../services/api/categories";
import { getSignedUploadUrl } from "../../services/api/upload";
import styles from "./CreateProductForm.module.css";

const WEIGHT_UNITS = ["mg", "g", "kg", "ml", "ltr", "pcs"];
const SIX_HOURS = 6 * 60 * 60 * 1000;

const DEFAULT_IMAGE = {
  url: "",
  alt: "",
};

const DEFAULT_VARIANT = {
  label: "",
  weight_value: "",
  weight_unit: "g",
  weight_in_grams: "",
  price: "",
  mrp: "",
  product_quantity: 1,
  available_quantity: 1,
  reserved_quantity: 1,
  reward_tokens_required: "",
};

const toNumber = (value, fallback) => {
  if (value === "" || value === null || value === undefined) return fallback;

  return Number(value);
};

function CreateProductForm({
  defaultShopTypeId = "",
  hideCatalogFields = false,
  isRewardProduct = false,
  isSubmitting,
  onSubmit,
  shopTypes = [],
  submitLabel = "Create Product",
}) {
  const [imageUploads, setImageUploads] = useState({});
  const firstShopTypeId =
    defaultShopTypeId || shopTypes[0]?.shop_type_id || shopTypes[0]?._id || "";
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
    setValue,
  } = useForm({
    defaultValues: {
      product_name: "",
      product_images: [DEFAULT_IMAGE],
      shop_type_id: firstShopTypeId,
      brand_name: "",
      product_category_id: "",
      product_description: "",
      variants: [DEFAULT_VARIANT],
    },
    mode: "onBlur",
  });
  const selectedShopTypeId = useWatch({
    control,
    name: "shop_type_id",
  });

  const {
    data: productCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["productCategories", selectedShopTypeId],
    queryFn: () => getCategoriesByShopType(selectedShopTypeId),
    enabled: !hideCatalogFields && Boolean(selectedShopTypeId),
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "product_images",
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    if (hideCatalogFields) return;
    if (productCategories.length === 0) return;

    setValue(
      "product_category_id",
      productCategories[0].product_category_id,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }, [hideCatalogFields, productCategories, setValue]);

  const handleCreateProduct = (formData) => {
    const productName = formData.product_name.trim();
    const basePayload = {
      product_name: productName,
      product_images: formData.product_images.map((image) => ({
        url: image.url.trim(),
        alt: image.alt?.trim() || productName,
      })),
      variants: formData.variants.map((variant, index) => ({
        label: variant.label.trim(),
        weight_value: Number(variant.weight_value),
        weight_unit: variant.weight_unit,
        weight_in_grams: toNumber(variant.weight_in_grams, 0),
        mrp: Number(variant.mrp),
        product_quantity: toNumber(variant.product_quantity, 1),
        is_default: index === 0,
        is_active: true,
        ...(isRewardProduct
          ? {
              reward_tokens_required: Number(variant.reward_tokens_required),
            }
          : {
              price: Number(variant.price),
              available_quantity: toNumber(variant.available_quantity, 1),
              reserved_quantity: toNumber(variant.reserved_quantity, 1),
              sort_order: index + 1,
            }),
      })),
      product_description: formData.product_description.trim(),
      brand_name: formData.brand_name.trim(),
    };
    const payload = isRewardProduct
      ? basePayload
      : {
          ...basePayload,
          availability: true,
          is_prescription_required: false,
          is_reward_product: false,
          shop_type_id: formData.shop_type_id.trim(),
          product_category_id: formData.product_category_id.trim(),
          product_type: "common",
        };

    onSubmit(payload);
  };

  const isImageUploading = Object.values(imageUploads).some(
    (upload) => upload.isUploading,
  );

  const setImageUploadState = (index, nextState) => {
    setImageUploads((currentUploads) => ({
      ...currentUploads,
      [index]: {
        ...currentUploads[index],
        ...nextState,
      },
    }));
  };

  const handleImageFileChange = async (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewReader = new FileReader();
    previewReader.onloadend = () => {
      setImageUploadState(index, {
        previewUrl: previewReader.result,
        error: "",
      });
    };
    previewReader.readAsDataURL(file);

    setImageUploadState(index, {
      isUploading: true,
      error: "",
    });

    try {
      const adminId = sessionStorage.getItem("optimuskart_admin_id") || "admin";
      const signedUploadData = await getSignedUploadUrl(adminId, file.type);
      const { path, presignedUrl } = signedUploadData || {};

      if (!path || !presignedUrl) {
        throw new Error("Upload URL response is invalid.");
      }

      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      setValue(`product_images.${index}.url`, path, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setImageUploadState(index, {
        isUploading: false,
        previewUrl: `https://image.optimuskart.com/${path}`,
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      setValue(`product_images.${index}.url`, "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setImageUploadState(index, {
        isUploading: false,
        error: "Failed to upload image. Please try again.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleClearImage = (index) => {
    setValue(`product_images.${index}.url`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setImageUploadState(index, {
      previewUrl: "",
      error: "",
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleCreateProduct)}>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>
            Product Name <b aria-hidden="true">*</b>
          </span>
          <input
            type="text"
            aria-invalid={errors.product_name ? "true" : "false"}
            {...register("product_name", {
              required: "Product name is required",
            })}
          />
          {errors.product_name ? (
            <small>{errors.product_name.message}</small>
          ) : null}
        </label>

        {hideCatalogFields ? null : (
          <label className={styles.field}>
            <span>
              Shop Type <b aria-hidden="true">*</b>
            </span>
            <select
              aria-invalid={errors.shop_type_id ? "true" : "false"}
              {...register("shop_type_id", {
                required: "Shop type id is required",
              })}
            >
              {shopTypes.map((shopType) => {
                const shopTypeId = shopType.shop_type_id || shopType._id;

                return (
                  <option key={shopTypeId} value={shopTypeId}>
                    {shopType.shop_type_name}
                  </option>
                );
              })}
            </select>
            {errors.shop_type_id ? (
              <small>{errors.shop_type_id.message}</small>
            ) : null}
          </label>
        )}

        <label className={styles.field}>
          <span>
            Brand Name <b aria-hidden="true">*</b>
          </span>
          <input
            type="text"
            aria-invalid={errors.brand_name ? "true" : "false"}
            {...register("brand_name", {
              required: "Brand name is required",
            })}
          />
          {errors.brand_name ? <small>{errors.brand_name.message}</small> : null}
        </label>

        {hideCatalogFields ? null : (
          <label className={styles.field}>
            <span>
              Product Category <b aria-hidden="true">*</b>
            </span>
            <select
              aria-invalid={errors.product_category_id ? "true" : "false"}
              disabled={isCategoriesLoading || isCategoriesError}
              {...register("product_category_id", {
                required: "Product category id is required",
              })}
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
            {errors.product_category_id ? (
              <small>{errors.product_category_id.message}</small>
            ) : null}
          </label>
        )}

        <label className={`${styles.field} ${styles.fullField}`}>
          <span>Description</span>
          <textarea rows="3" {...register("product_description")} />
        </label>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Product Images</h3>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => appendImage(DEFAULT_IMAGE)}
          >
            Add Image
          </button>
        </div>

        {imageFields.map((field, index) => (
          <div key={field.id} className={styles.imageRow}>
            <label className={styles.uploadField}>
              <input
                type="hidden"
                {...register(`product_images.${index}.url`, {
                  required: "Image is required",
                })}
              />
              <span>
                Product Image <b aria-hidden="true">*</b>
              </span>
              <div className={styles.uploadControl}>
                {imageUploads[index]?.previewUrl ? (
                  <div className={styles.previewWrap}>
                    <img
                      src={imageUploads[index].previewUrl}
                      alt="Product preview"
                    />
                    <button
                      type="button"
                      className={styles.clearImageButton}
                      onClick={() => handleClearImage(index)}
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    {imageUploads[index]?.isUploading
                      ? "Uploading..."
                      : "Choose image"}
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageFileChange(event, index)}
                  disabled={imageUploads[index]?.isUploading}
                />
              </div>
              {errors.product_images?.[index]?.url ? (
                <small>{errors.product_images[index].url.message}</small>
              ) : null}
              {imageUploads[index]?.error ? (
                <small>{imageUploads[index].error}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Alt Text</span>
              <input type="text" {...register(`product_images.${index}.alt`)} />
            </label>

            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeImage(index)}
              disabled={imageFields.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Variants</h3>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => appendVariant(DEFAULT_VARIANT)}
          >
            Add Variant
          </button>
        </div>

        {variantFields.map((field, index) => (
          <div key={field.id} className={styles.variantCard}>
            <div className={styles.variantHeader}>
              <h4>Variant {index + 1}</h4>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeVariant(index)}
                disabled={variantFields.length === 1}
              >
                Remove
              </button>
            </div>

            <div className={styles.variantGrid}>
              <label className={styles.field}>
                <span>
                  Label <b aria-hidden="true">*</b>
                </span>
                <input
                  type="text"
                  aria-invalid={
                    errors.variants?.[index]?.label ? "true" : "false"
                  }
                  {...register(`variants.${index}.label`, {
                    required: "Label is required",
                  })}
                />
                {errors.variants?.[index]?.label ? (
                  <small>{errors.variants[index].label.message}</small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>
                  Weight Value <b aria-hidden="true">*</b>
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  aria-invalid={
                    errors.variants?.[index]?.weight_value ? "true" : "false"
                  }
                  {...register(`variants.${index}.weight_value`, {
                    required: "Weight value is required",
                    valueAsNumber: true,
                  })}
                />
                {errors.variants?.[index]?.weight_value ? (
                  <small>{errors.variants[index].weight_value.message}</small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>
                  Weight Unit <b aria-hidden="true">*</b>
                </span>
                <select {...register(`variants.${index}.weight_unit`)}>
                  {WEIGHT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>

              {isRewardProduct ? null : (
                <label className={styles.field}>
                  <span>
                    Price <b aria-hidden="true">*</b>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    aria-invalid={
                      errors.variants?.[index]?.price ? "true" : "false"
                    }
                    {...register(`variants.${index}.price`, {
                      required: "Price is required",
                      valueAsNumber: true,
                    })}
                  />
                  {errors.variants?.[index]?.price ? (
                    <small>{errors.variants[index].price.message}</small>
                  ) : null}
                </label>
              )}

              <label className={styles.field}>
                <span>
                  MRP <b aria-hidden="true">*</b>
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  aria-invalid={errors.variants?.[index]?.mrp ? "true" : "false"}
                  {...register(`variants.${index}.mrp`, {
                    required: "MRP is required",
                    valueAsNumber: true,
                  })}
                />
                {errors.variants?.[index]?.mrp ? (
                  <small>{errors.variants[index].mrp.message}</small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>Weight In Grams</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register(`variants.${index}.weight_in_grams`)}
                />
              </label>

              <label className={styles.field}>
                <span>
                  Product Quantity
                  {isRewardProduct ? <b aria-hidden="true">*</b> : null}
                </span>
                <input
                  type="number"
                  min="0"
                  aria-invalid={
                    errors.variants?.[index]?.product_quantity
                      ? "true"
                      : "false"
                  }
                  {...register(`variants.${index}.product_quantity`, {
                    required: isRewardProduct
                      ? "Product quantity is required"
                      : false,
                    valueAsNumber: true,
                  })}
                />
                {errors.variants?.[index]?.product_quantity ? (
                  <small>
                    {errors.variants[index].product_quantity.message}
                  </small>
                ) : null}
              </label>

              {isRewardProduct ? (
                <label className={styles.field}>
                  <span>
                    Reward Tokens Required <b aria-hidden="true">*</b>
                  </span>
                  <input
                    type="number"
                    min="0"
                    aria-invalid={
                      errors.variants?.[index]?.reward_tokens_required
                        ? "true"
                        : "false"
                    }
                    {...register(`variants.${index}.reward_tokens_required`, {
                      required: "Reward tokens required is required",
                      valueAsNumber: true,
                    })}
                  />
                  {errors.variants?.[index]?.reward_tokens_required ? (
                    <small>
                      {
                        errors.variants[index].reward_tokens_required
                          .message
                      }
                    </small>
                  ) : null}
                </label>
              ) : (
                <label className={styles.field}>
                  <span>Available Quantity</span>
                  <input
                    type="number"
                    min="0"
                    {...register(`variants.${index}.available_quantity`)}
                  />
                </label>
              )}

              {isRewardProduct ? null : (
                <label className={styles.field}>
                  <span>Reserved Quantity</span>
                  <input
                    type="number"
                    min="0"
                    {...register(`variants.${index}.reserved_quantity`)}
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!isValid || isSubmitting || isImageUploading}
        >
          {isSubmitting ? "Creating..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default CreateProductForm;
