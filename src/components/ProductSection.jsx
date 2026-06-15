import { useState } from "react";
import ModalPortal from "./ModalPortal";
import {
  createProductApi,
  deleteProductApi,
  getCategoriesByShopTypeApi,
  getUploadSignedUrlApi,
  updateProductApi,
} from "../auth/dashboardApi";
import { compressImage, uploadFileToSignedUrl } from "../utils/imageUploader";

export default function ProductSection({
  products,
  shopTypes = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  userRole,
  currentUserId,
  currentUserName,
  activeSellerId,
  createProductEndpoint = "/product/seller/create",
  getUpdateProductEndpoint = () => "/product/",
  getDeleteProductEndpoint = (id) => `/product/delete/${id}`,
  isLoading = false,
  isError = false,
  pagination = null,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedShopTypeId, setSelectedShopTypeId] = useState("");
  const [brandName, setBrandName] = useState("");
  const [price, setPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [quantityPrefix, setQuantityPrefix] = useState("");
  const [productWeight, setProductWeight] = useState("");
  const [weightPrefix, setWeightPrefix] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [availability, setAvailability] = useState(true);
  const [isPrescriptionRequired, setIsPrescriptionRequired] = useState(false);
  const [isRewardProduct, setIsRewardProduct] = useState(false);
  const [rewardTokensRequired, setRewardTokensRequired] = useState("");
  const [customSellerId, setCustomSellerId] = useState("");
  const [customSellerName, setCustomSellerName] = useState("");
  const [shopTypeCategories, setShopTypeCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = userRole?.toLowerCase() === "admin";
  const productType = activeSellerId ? "individual" : "common";

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    setImageFile(file ?? null);
    setImagePreview("");

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(String(reader.result));
      reader.readAsDataURL(file);
    }
  }

  function resetForm() {
    setEditingProduct(null);
    setName("");
    setCategoryId("");
    setSelectedShopTypeId("");
    setBrandName("");
    setPrice("");
    setProductQuantity("");
    setQuantityPrefix("");
    setProductWeight("");
    setWeightPrefix("");
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    setImageAlt("");
    setAvailability(true);
    setIsPrescriptionRequired(false);
    setIsRewardProduct(false);
    setRewardTokensRequired("");
    setCustomSellerId("");
    setCustomSellerName("");
    setShopTypeCategories([]);
    setIsCategoriesLoading(false);
    setError("");
    setIsSubmitting(false);
  }

  function closeModal() {
    resetForm();
    setIsModalOpen(false);
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function getPositiveNumber(value, label) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      throw new Error(`${label} must be greater than 0.`);
    }

    return numericValue;
  }

  function getPositiveInteger(value, label) {
    const numericValue = getPositiveNumber(value, label);

    if (!Number.isInteger(numericValue)) {
      throw new Error(`${label} must be a whole number.`);
    }

    return numericValue;
  }

  async function handleShopTypeChange(shopTypeId, nextCategoryId = "") {
    setSelectedShopTypeId(shopTypeId);
    setCategoryId("");
    setShopTypeCategories([]);

    if (!shopTypeId) return;

    try {
      setError("");
      setIsCategoriesLoading(true);

      const response = await getCategoriesByShopTypeApi(shopTypeId);
      const categoriesByShopType = (response.data ?? []).map((category) => ({
        id: category.product_category_id,
        name: category.product_category_name,
        type: category.product_category_type,
        image: category.product_category_image,
        shopTypeId,
        shopId: category.shop_id,
        shopTypeName: category.product_category_type || "Category",
        sellerId: category.seller_id || "",
        createdAt: "API",
      }));

      setShopTypeCategories(categoriesByShopType);
      setCategoryId(nextCategoryId);
    } catch (categoryError) {
      setError(categoryError.message || "Unable to load categories.");
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  async function openEditModal(product) {
    const productImages = product.productImages?.length
      ? product.productImages
      : product.image
        ? [{ url: product.image, alt: product.name }]
        : [];
    const firstImage = productImages[0];

    resetForm();
    setEditingProduct(product);
    setName(product.name || "");
    setCategoryId(product.categoryId || "");
    setSelectedShopTypeId(product.shopTypeId || "");
    setBrandName(product.brandName || "");
    setPrice(product.price ?? "");
    setProductQuantity(product.productQuantity ?? product.stock ?? "");
    setQuantityPrefix(product.quantityPrefix || "");
    setProductWeight(product.productWeight ?? "");
    setWeightPrefix(product.weightPrefix || "");
    setDescription(product.description || "");
    setImagePreview(firstImage?.url || product.image || "");
    setImageAlt(firstImage?.alt || product.name || "");
    setAvailability(product.availability ?? true);
    setIsPrescriptionRequired(product.isPrescriptionRequired ?? false);
    setIsRewardProduct(product.isRewardProduct ?? false);
    setRewardTokensRequired(product.rewardTokensRequired ?? "");
    setCustomSellerId(product.sellerId || "");
    setCustomSellerName(product.sellerName || "");
    setIsModalOpen(true);

    if (product.shopTypeId) {
      await handleShopTypeChange(product.shopTypeId, product.categoryId || "");
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    try {
      await deleteProductApi(getDeleteProductEndpoint(product.id));
      onDeleteProduct?.(product.id);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete product.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedBrandName = brandName.trim();
    const trimmedImageAlt = imageAlt.trim();
    const trimmedDescription = description.trim();
    const customSellerIdValue = customSellerId.trim();
    const trimmedCustomSellerName = customSellerName.trim();

    if (!trimmedName) {
      setError("Product Name is required.");
      return;
    }
    if (!trimmedBrandName) {
      setError("Brand Name is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a Category.");
      return;
    }
    if (!editingProduct && !imageFile) {
      setError("Product image is required.");
      return;
    }
    if (!trimmedImageAlt) {
      setError("Image alt text is required.");
      return;
    }

    const shouldCreateAdminProduct =
      isAdmin && !activeSellerId && !customSellerIdValue;
    let targetSellerId = activeSellerId || currentUserId || "101";
    let targetSellerName = currentUserName || "Fresh Organics Ltd";

    if (isAdmin && !activeSellerId && customSellerIdValue) {
      targetSellerId = customSellerIdValue;
      targetSellerName = trimmedCustomSellerName || `Seller #${customSellerIdValue}`;
    } else if (shouldCreateAdminProduct) {
      targetSellerName = "Admin";
    }

    const selectedCategory = shopTypeCategories.find(
      (c) => c.id === categoryId,
    );
    const categoryName = selectedCategory ? selectedCategory.name : "";
    const shopTypeId = selectedShopTypeId || selectedCategory?.shopTypeId;
    const shopId = selectedCategory?.shopId;

    if (!shopTypeId) {
      setError("Selected category is missing shop type id.");
      return;
    }
    if (!shopId && !shouldCreateAdminProduct) {
      setError("Selected category is missing shop id.");
      return;
    }
    if (shouldCreateAdminProduct && !description.trim()) {
      setError("Product description is required.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const productPrice = getPositiveNumber(price, "Product price");
      if (productPrice > 1000000) {
        throw new Error("Price is too high.");
      }

      let normalizedProductWeight;
      if (productWeight !== "") {
        normalizedProductWeight = getPositiveNumber(
          productWeight,
          "Product weight",
        );
      } else if (weightPrefix) {
        throw new Error(
          "Product weight is required when weight unit is provided.",
        );
      }

      if (productWeight !== "" && !weightPrefix) {
        throw new Error(
          "Weight unit is required when product weight is provided.",
        );
      }

      let normalizedProductQuantity;
      if (productQuantity !== "") {
        normalizedProductQuantity = getPositiveNumber(
          productQuantity,
          "Product quantity",
        );
        if (normalizedProductQuantity > 100000) {
          throw new Error("Product quantity is too high.");
        }
      } else if (quantityPrefix) {
        throw new Error(
          "Product quantity is required when quantity unit is provided.",
        );
      }

      if (productQuantity !== "" && !quantityPrefix) {
        throw new Error(
          "Quantity unit is required when product quantity is provided.",
        );
      }

      let normalizedRewardTokensRequired;
      if (isRewardProduct) {
        if (rewardTokensRequired === "") {
          throw new Error("Reward tokens are required for reward products.");
        }
        normalizedRewardTokensRequired = getPositiveInteger(
          rewardTokensRequired,
          "Reward tokens",
        );
      }

      const payload = editingProduct
        ? {
            product_id: editingProduct.id,
          }
        : {
            product_name: trimmedName,
            product_price: productPrice,
            availability,
            shop_type_id: shopTypeId,
            is_prescription_required: isPrescriptionRequired,
            is_reward_product: isRewardProduct,
            brand_name: trimmedBrandName,
            product_category_id: categoryId,
            product_type: productType,
          };

      if (!editingProduct) {
        if (!shouldCreateAdminProduct) {
          payload.user_id = targetSellerId;
          payload.shop_id = shopId;
        }

        if (trimmedDescription) {
          payload.product_description = trimmedDescription;
        }

        if (normalizedProductWeight !== undefined) {
          payload.product_weight = normalizedProductWeight;
          payload.weight_prefix = weightPrefix;
        }

        if (normalizedProductQuantity !== undefined) {
          payload.product_quantity = normalizedProductQuantity;
          payload.quantity_prefix = quantityPrefix;
        }

        if (normalizedRewardTokensRequired !== undefined) {
          payload.reward_tokens_required = normalizedRewardTokensRequired;
        }
      } else {
        if (trimmedName !== (editingProduct.name || "").trim()) {
          payload.product_name = trimmedName;
        }
        if (productPrice !== Number(editingProduct.price)) {
          payload.product_price = productPrice;
        }
        if (availability !== (editingProduct.availability ?? true)) {
          payload.availability = availability;
        }
        if (String(shopTypeId) !== String(editingProduct.shopTypeId || "")) {
          payload.shop_type_id = shopTypeId;
        }
        if (
          isPrescriptionRequired !==
          (editingProduct.isPrescriptionRequired ?? false)
        ) {
          payload.is_prescription_required = isPrescriptionRequired;
        }
        if (isRewardProduct !== (editingProduct.isRewardProduct ?? false)) {
          payload.is_reward_product = isRewardProduct;
        }
        if (trimmedBrandName !== (editingProduct.brandName || "").trim()) {
          payload.brand_name = trimmedBrandName;
        }
        if (String(categoryId) !== String(editingProduct.categoryId || "")) {
          payload.product_category_id = categoryId;
        }
        if (
          trimmedDescription !== (editingProduct.description || "").trim()
        ) {
          payload.product_description = trimmedDescription;
        }
        if (
          (normalizedProductQuantity !== undefined &&
            normalizedProductQuantity !==
              Number(editingProduct.productQuantity ?? editingProduct.stock)) ||
          quantityPrefix !== (editingProduct.quantityPrefix || "")
        ) {
          if (normalizedProductQuantity !== undefined) {
            payload.product_quantity = normalizedProductQuantity;
          }
          payload.quantity_prefix = quantityPrefix;
        }
        if (
          (normalizedProductWeight !== undefined &&
            normalizedProductWeight !==
              Number(editingProduct.productWeight ?? "")) ||
          weightPrefix !== (editingProduct.weightPrefix || "")
        ) {
          if (normalizedProductWeight !== undefined) {
            payload.product_weight = normalizedProductWeight;
          }
          payload.weight_prefix = weightPrefix;
        }
        if (
          isRewardProduct &&
          normalizedRewardTokensRequired !==
            Number(editingProduct.rewardTokensRequired ?? "")
        ) {
          payload.reward_tokens_required = normalizedRewardTokensRequired;
        }
        if (
          !shouldCreateAdminProduct &&
          String(targetSellerId) !== String(editingProduct.sellerId || "")
        ) {
          payload.user_id = targetSellerId;
        }
        if (
          !shouldCreateAdminProduct &&
          (payload.product_category_id ||
            payload.shop_type_id ||
            String(shopId) !== String(editingProduct.shopId || ""))
        ) {
          payload.shop_id = shopId;
        }
        if (Object.keys(payload).length === 1 && !imageFile) {
          closeModal();
          return;
        }
      }

      if (imageFile) {
        const compressedImage = await compressImage(imageFile);
        const signedUrlResponse = await getUploadSignedUrlApi(targetSellerId);
        const { path, presignedUrl } = signedUrlResponse.data ?? {};

        if (!path || !presignedUrl) {
          throw new Error("Signed upload URL is missing.");
        }

        await uploadFileToSignedUrl(compressedImage, presignedUrl);

        payload.product_images = [
          {
            url: path,
            alt: trimmedImageAlt,
          },
        ];
      }

      const productEndpoint = shouldCreateAdminProduct
        ? "/product/admin/create"
        : createProductEndpoint;
      const response = editingProduct
        ? await updateProductApi(
            getUpdateProductEndpoint(editingProduct.id),
            payload,
          )
        : await createProductApi(productEndpoint, payload);
      const createdProduct = response.data ?? {};
      const mainImage =
        createdProduct.product_images?.find((image) => image.is_main) ??
        createdProduct.product_images?.[0] ??
        payload.product_images?.[0] ??
        editingProduct?.productImages?.[0];
      const createdQuantity =
        createdProduct.product_quantity ??
        payload.product_quantity ??
        editingProduct?.productQuantity ??
        editingProduct?.stock;

      const newProduct = {
        id:
          createdProduct.product_id ||
          editingProduct?.id ||
          Date.now().toString(),
        name:
          createdProduct.product_name ||
          payload.product_name ||
          editingProduct?.name,
        categoryId: createdProduct.product_category_id || categoryId,
        categoryName,
        shopTypeId: createdProduct.shop_type_id || shopTypeId,
        shopId: createdProduct.shop_id || shopId,
        brandName:
          createdProduct.brand_name ||
          payload.brand_name ||
          editingProduct?.brandName,
        price:
          createdProduct.product_price ??
          payload.product_price ??
          editingProduct?.price,
        stock: createdQuantity,
        productQuantity: createdQuantity,
        availableQuantity:
          createdProduct.available_quantity ??
          createdProduct.product_quantity ??
          payload.product_quantity,
        description:
          createdProduct.product_description ||
          payload.product_description ||
          editingProduct?.description ||
          "",
        image: mainImage?.url || imagePreview,
        productImages:
          createdProduct.product_images ??
          payload.product_images ??
          editingProduct?.productImages ??
          [],
        sellerId: targetSellerId,
        sellerName: targetSellerName,
        availability,
        isPrescriptionRequired,
        isRewardProduct,
        rewardTokensRequired:
          payload.reward_tokens_required ?? editingProduct?.rewardTokensRequired,
        quantityPrefix:
          payload.quantity_prefix ?? editingProduct?.quantityPrefix,
        productWeight: payload.product_weight ?? editingProduct?.productWeight,
        weightPrefix: payload.weight_prefix ?? editingProduct?.weightPrefix,
        createdAt: editingProduct?.createdAt || new Date().toLocaleDateString(),
      };

      if (editingProduct) {
        onUpdateProduct?.(newProduct);
      } else {
        onAddProduct(newProduct);
      }
      closeModal();
    } catch (submitError) {
      setError(submitError.message || "Unable to create product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const paginationControls = pagination && (
    <div className="pagination-row">
      <button
        type="button"
        className="btn-secondary"
        onClick={pagination.onPrevious}
        disabled={!pagination.canGoPrevious || isLoading}
      >
        Previous
      </button>
      <span>
        Page <strong>{pagination.page}</strong>
      </span>
      <button
        type="button"
        className="btn-secondary"
        onClick={pagination.onNext}
        disabled={!pagination.canGoNext || isLoading}
      >
        Next
      </button>
    </div>
  );
  const filteredCategories = shopTypeCategories;

  return (
    <section className="inventory-section">
      <div className="section-header">
        <h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Products{" "}
          {activeSellerId
            ? `(Seller ID: ${activeSellerId})`
            : isAdmin
              ? "(All Sellers)"
              : `(My Products)`}
        </h2>
        <button className="btn-create" onClick={openCreateModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Product
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <p>Loading products...</p>
        </div>
      ) : isError ? (
        <div className="empty-state">
          <p>
            {activeSellerId
              ? "Unable to load seller products. Please try again."
              : "Unable to load products. Please try again."}
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>
            {activeSellerId
              ? 'No products found for this seller. Click "Create Product" to add one.'
              : 'No products found. Click "Create Product" to add one.'}
          </p>
          {paginationControls}
        </div>
      ) : (
        <div>
          <div className="products-grid">
            {products.map((product) => {
              const productImages = product.productImages?.length
                ? product.productImages
                : product.image
                  ? [{ url: product.image, alt: product.name }]
                  : [];

              return (
                <div key={product.id} className="inventory-card product-card">
                  <div className="product-card-images">
                    {productImages.length > 0 ? (
                      productImages.map((image, imageIndex) => (
                        <img
                          key={`${image.url}-${imageIndex}`}
                          src={image.url}
                          alt={image.alt || product.name}
                          title={image.alt || product.name}
                        />
                      ))
                    ) : (
                      <span>{product.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-heading">
                      <h3 className="card-title">{product.name}</h3>
                      <strong>Rs {Number(product.price).toFixed(2)}</strong>
                    </div>
                    <p className="product-card-desc">
                      {product.description || "No description"}
                    </p>
                    <div className="product-card-badges">
                      <span className="card-badge category">
                        {product.categoryName || "Uncategorized"}
                      </span>
                      {(isAdmin || activeSellerId) && (
                        <span
                          className="card-badge seller"
                          title={`ID: ${product.sellerId}`}
                        >
                          {product.sellerName || `Seller #${product.sellerId}`}
                        </span>
                      )}
                    </div>
                    <div className="product-card-meta">
                      <span>
                        Quantity:{" "}
                        <strong>{product.productQuantity ?? product.stock}</strong>
                      </span>
                      <span>
                        Available:{" "}
                        <strong>
                          {product.availableQuantity ?? product.stock}
                        </strong>
                      </span>
                    </div>
                    <div className="actions-cell">
                      <button
                        type="button"
                        className="btn-action edit"
                        onClick={() => openEditModal(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-action delete"
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {paginationControls}
        </div>
      )}

      <ModalPortal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? "Edit Product" : "Create New Product"}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="prod-name">Product Name *</label>
            <input
              id="prod-name"
              type="text"
              placeholder="e.g. Organic Bananas, Wireless Mouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prod-image">
              Product Image {editingProduct ? "" : "*"}
            </label>
            <input
              id="prod-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!editingProduct}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Product preview"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="prod-image-alt">Image Alt Text *</label>
            <input
              id="prod-image-alt"
              type="text"
              placeholder="e.g. Front view of product"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prod-brand">Brand Name *</label>
            <input
              id="prod-brand"
              type="text"
              placeholder="e.g. Acme"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prod-shop-type">Shop Type *</label>
            {shopTypes.length === 0 ? (
              <p className="form-error" style={{ margin: 0 }}>
                Please create at least one Shop Type first!
              </p>
            ) : (
              <select
                id="prod-shop-type"
                value={selectedShopTypeId}
                onChange={(e) => handleShopTypeChange(e.target.value)}
                required
              >
                <option value="">-- Select a Shop Type --</option>
                {shopTypes.map((shopType) => (
                  <option key={shopType.id} value={shopType.id}>
                    {shopType.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="prod-cat">Category *</label>
            {!selectedShopTypeId ? (
              <p className="form-error" style={{ margin: 0 }}>
                Please select a Shop Type first.
              </p>
            ) : isCategoriesLoading ? (
              <p className="form-error" style={{ margin: 0 }}>
                Loading categories...
              </p>
            ) : filteredCategories.length === 0 ? (
              <p className="form-error" style={{ margin: 0 }}>
                No categories found for the selected Shop Type.
              </p>
            ) : (
              <select
                id="prod-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">-- Select a Category --</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label htmlFor="prod-price">Price (Rs) *</label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prod-type">Product Type *</label>
              <select
                id="prod-type"
                value={productType}
                disabled
                required
              >
                <option value={productType}>
                  {productType === "common" ? "Common" : "Individual"}
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label htmlFor="prod-quantity">Product Quantity</label>
              <input
                id="prod-quantity"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prod-quantity-prefix">Quantity Unit</label>
              <select
                id="prod-quantity-prefix"
                value={quantityPrefix}
                onChange={(e) => setQuantityPrefix(e.target.value)}
              >
                <option value="">-- Select Unit --</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
                <option value="ltr">ltr</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label htmlFor="prod-weight">Product Weight</label>
              <input
                id="prod-weight"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0"
                value={productWeight}
                onChange={(e) => setProductWeight(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prod-weight-prefix">Weight Unit</label>
              <select
                id="prod-weight-prefix"
                value={weightPrefix}
                onChange={(e) => setWeightPrefix(e.target.value)}
              >
                <option value="">-- Select Unit --</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
              }}
            >
              <input
                type="checkbox"
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
                style={{ width: "auto" }}
              />
              Available
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
              }}
            >
              <input
                type="checkbox"
                checked={isPrescriptionRequired}
                onChange={(e) => setIsPrescriptionRequired(e.target.checked)}
                style={{ width: "auto" }}
              />
              Prescription Required
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
              }}
            >
              <input
                type="checkbox"
                checked={isRewardProduct}
                onChange={(e) => setIsRewardProduct(e.target.checked)}
                style={{ width: "auto" }}
              />
              Reward Product
            </label>
          </div>

          {isRewardProduct && (
            <div className="form-group">
              <label htmlFor="prod-reward-tokens">
                Reward Tokens Required *
              </label>
              <input
                id="prod-reward-tokens"
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={rewardTokensRequired}
                onChange={(e) => setRewardTokensRequired(e.target.value)}
                required={isRewardProduct}
              />
            </div>
          )}

          {isAdmin && !activeSellerId && (
            <div
              style={{
                border: "1px solid #e2e8f0",
                padding: "14px",
                borderRadius: "8px",
                background: "#f7fafc",
                display: "grid",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color: "#1a202c",
                  marginBottom: "2px",
                }}
              >
                Admin Assignment Panel
              </div>
              <div className="form-group">
                <label htmlFor="prod-seller-id">Assign to Seller ID</label>
                <input
                  id="prod-seller-id"
                  type="text"
                  placeholder="Leave empty for admin product"
                  value={customSellerId}
                  onChange={(e) => setCustomSellerId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="prod-seller-name">Seller Business Name</label>
                <input
                  id="prod-seller-name"
                  type="text"
                  placeholder="e.g. Acme Retailers"
                  value={customSellerName}
                  onChange={(e) => setCustomSellerName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="prod-desc">Description</label>
            <textarea
              id="prod-desc"
              placeholder="Describe this product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={
                shopTypes.length === 0 ||
                isCategoriesLoading ||
                filteredCategories.length === 0 ||
                isSubmitting
              }
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </ModalPortal>
    </section>
  );
}
