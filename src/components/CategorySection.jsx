import { useState } from "react";
import ModalPortal from "./ModalPortal";
import {
  createProductCategoryApi,
  deleteProductCategoryApi,
  getUploadSignedUrlApi,
  updateProductCategoryApi,
} from "../auth/dashboardApi";
import { compressImage, uploadFileToSignedUrl } from "../utils/imageUploader";

export default function CategorySection({
  categories,
  shopTypes = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  activeSellerId,
  createCategoryEndpoint = "/categories/create",
  getUpdateCategoryEndpoint = () => "/categories/update",
  getDeleteCategoryEndpoint = (id) => `/categories/delete/${id}`,
  isLoading = false,
  isError = false,
  pagination = null,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [selectedShopTypeId, setSelectedShopTypeId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setEditingCategory(null);
    setName("");
    setSelectedShopTypeId("");
    setImageFile(null);
    setImagePreview("");
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

  function openEditModal(category) {
    setEditingCategory(category);
    setName(category.name || "");
    setSelectedShopTypeId(category.shopTypeId || "");
    setImageFile(null);
    setImagePreview(category.image || "");
    setError("");
    setIsSubmitting(false);
    setIsModalOpen(true);
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete ${category.name}?`)) return;

    try {
      await deleteProductCategoryApi(getDeleteCategoryEndpoint(category.id));
      onDeleteCategory?.(category.id);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete category.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editingCategory && !name.trim()) {
      setError("Category Name is required.");
      return;
    }
    if (!editingCategory && !imageFile) {
      setError("Category image is required.");
      return;
    }
    if (!editingCategory && !selectedShopTypeId) {
      setError("Shop Type is required.");
      return;
    }

    const userId = sessionStorage.getItem("user_id");
    const uploadOwnerId = activeSellerId || userId;

    if (!uploadOwnerId) {
      setError("User ID is required to upload the category image.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      let imagePath = editingCategory?.image || "";

      if (imageFile) {
        const compressedImage = await compressImage(imageFile);
        const signedUrlResponse = await getUploadSignedUrlApi(uploadOwnerId);
        const { path, presignedUrl } = signedUrlResponse.data ?? {};

        if (!path || !presignedUrl) {
          throw new Error("Signed upload URL is missing.");
        }

        await uploadFileToSignedUrl(compressedImage, presignedUrl);
        imagePath = path;
      }

      const payload = {
        product_category_name: name.trim() || editingCategory?.name,
        product_category_image: imagePath,
        shop_type_id: selectedShopTypeId || editingCategory?.shopTypeId,
      };
      if (editingCategory) {
        payload.product_category_id = editingCategory.id;
      }

      const response = editingCategory
        ? await updateProductCategoryApi(
            getUpdateCategoryEndpoint(editingCategory.id),
            payload,
          )
        : await createProductCategoryApi(createCategoryEndpoint, payload);

      const createdCategory = response.data ?? {};
      const selectedShopType = shopTypes.find(
        (shopType) => String(shopType.id) === String(payload.shop_type_id),
      );
      const newCategory = {
        id:
          createdCategory.product_category_id ||
          editingCategory?.id ||
          Date.now().toString(),
        name:
          createdCategory.product_category_name ||
          payload.product_category_name,
        image: createdCategory.product_category_image || imagePath,
        sellerId:
          createdCategory.seller_id ||
          editingCategory?.sellerId ||
          activeSellerId ||
          "",
        shopTypeId: createdCategory.shop_type_id || payload.shop_type_id,
        shopTypeName:
          createdCategory.product_category_type ||
          selectedShopType?.name ||
          "Category",
        createdAt:
          editingCategory?.createdAt || new Date().toLocaleDateString(),
      };

      if (editingCategory) {
        onUpdateCategory?.(newCategory);
      } else {
        onAddCategory(newCategory);
      }
      closeModal();
    } catch (uploadError) {
      setError(uploadError.message || "Unable to save category.");
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
            <path d="M12 2L2 7l10 5 10-5L12 2z"></path>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          Product Categories{" "}
          {activeSellerId && `(Seller ID: ${activeSellerId})`}
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
          Create Category
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <p>Loading product categories...</p>
        </div>
      ) : isError ? (
        <div className="empty-state">
          <p>
            {activeSellerId
              ? "Unable to load seller categories. Please try again."
              : "Unable to load categories. Please try again."}
          </p>
        </div>
      ) : categories.length === 0 ? (
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
            <path d="M12 2L2 7l10 5 10-5L12 2z"></path>
          </svg>
          <p>
            {activeSellerId
              ? 'No product categories found for this seller. Click "Create Category" to add one.'
              : 'No product categories found. Click "Create Category" to add one.'}
          </p>
          {paginationControls}
        </div>
      ) : (
        <div>
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="inventory-card category-card">
                <div className="category-card-main">
                  <div className="category-image-box">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                      />
                    ) : (
                      category.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="category-card-copy">
                    <h3 className="card-title">{category.name}</h3>
                    <span className="card-badge category">
                      {category.shopTypeName || "Category"}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <span>
                    Created: <strong>{category.createdAt}</strong>
                  </span>
                </div>
                <div className="actions-cell">
                  <button
                    type="button"
                    className="btn-action edit"
                    onClick={() => openEditModal(category)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-action delete"
                    onClick={() => handleDelete(category)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {paginationControls}
        </div>
      )}

      <ModalPortal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? "Edit Category" : "Create New Category"}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="cat-name">
              Product Category Name {editingCategory ? "" : "*"}
            </label>
            <input
              id="cat-name"
              type="text"
              placeholder="e.g. Face Wash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!editingCategory}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cat-shop-type">
              Shop Type {editingCategory ? "" : "*"}
            </label>
            {shopTypes.length === 0 ? (
              <p className="form-error" style={{ margin: 0 }}>
                Please create at least one Shop Type first!
              </p>
            ) : (
              <select
                id="cat-shop-type"
                value={selectedShopTypeId}
                onChange={(e) => setSelectedShopTypeId(e.target.value)}
                required={!editingCategory}
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
            <label htmlFor="cat-image">
              Category Image {editingCategory ? "" : "*"}
            </label>
            <input
              id="cat-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!editingCategory}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Category preview"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            )}
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
              disabled={isSubmitting || (!editingCategory && shopTypes.length === 0)}
            >
              {isSubmitting ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </ModalPortal>
    </section>
  );
}
