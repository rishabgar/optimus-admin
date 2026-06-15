import { useState } from "react";
import ModalPortal from "./ModalPortal";
import {
  createShopTypeApi,
  deleteShopTypeApi,
  getUploadSignedUrlApi,
  updateShopTypeApi,
} from "../auth/dashboardApi";
import { compressImage, uploadFileToSignedUrl } from "../utils/imageUploader";

export default function ShopTypeSection({
  shopTypes,
  onAddShopType,
  onUpdateShopType,
  onDeleteShopType,
  activeSellerId,
  createShopTypeEndpoint = "/shop/type/create",
  getUpdateShopTypeEndpoint = (id) => `/shop/type/${id}`,
  getDeleteShopTypeEndpoint = (id) => `/shop/type/${id}`,
  isLoading = false,
  isError = false,
  isReadOnly = false,
  onSelectShopType,
  selectedShopTypeId,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShopType, setEditingShopType] = useState(null);
  const [name, setName] = useState("");
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
    setEditingShopType(null);
    setName("");
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

  function openEditModal(shopType) {
    setEditingShopType(shopType);
    setName(shopType.name || "");
    setImageFile(null);
    setImagePreview(shopType.image || "");
    setError("");
    setIsSubmitting(false);
    setIsModalOpen(true);
  }

  async function handleDelete(shopType) {
    if (!window.confirm(`Delete ${shopType.name}?`)) return;

    try {
      await deleteShopTypeApi(getDeleteShopTypeEndpoint(shopType.id));
      onDeleteShopType?.(shopType.id);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete shop type.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!name.trim()) {
      setError("Shop type name is required.");
      return;
    }
    if (!editingShopType && !imageFile) {
      setError("Shop type image is required.");
      return;
    }

    const userId = sessionStorage.getItem("user_id");
    const uploadOwnerId = activeSellerId || userId;

    if (!uploadOwnerId) {
      setError("User ID is required to upload the shop type image.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      let imagePath = "";

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

      const payload = editingShopType
        ? {}
        : {
            shop_type_name: trimmedName,
            shop_type_image: imagePath,
          };

      if (editingShopType) {
        if (trimmedName !== (editingShopType.name || "").trim()) {
          payload.shop_type_name = trimmedName;
        }
        if (imageFile) {
          payload.shop_type_image = imagePath;
        }
        if (Object.keys(payload).length === 0) {
          closeModal();
          return;
        }
      }

      const response = editingShopType
        ? await updateShopTypeApi(
            getUpdateShopTypeEndpoint(editingShopType.id),
            payload,
          )
        : await createShopTypeApi(createShopTypeEndpoint, payload);
      const createdShopType = response.data ?? {};

      const newShopType = {
        id:
          createdShopType.shop_type_id ||
          editingShopType?.id ||
          Date.now().toString(),
        name:
          createdShopType.shop_type_name ||
          payload.shop_type_name ||
          editingShopType?.name,
        image:
          createdShopType.shop_type_image ||
          payload.shop_type_image ||
          editingShopType?.image ||
          "",
        status: editingShopType?.status || "Active",
        sellerId: editingShopType?.sellerId || activeSellerId || uploadOwnerId,
        createdAt: editingShopType?.createdAt || new Date().toLocaleDateString(),
      };

      if (editingShopType) {
        onUpdateShopType?.(newShopType);
      } else {
        onAddShopType(newShopType);
      }
      closeModal();
    } catch (submitError) {
      setError(submitError.message || "Unable to save shop type.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="inventory-section">
      <div className="section-header">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Shop Types {activeSellerId && `(Seller ID: ${activeSellerId})`}
        </h2>
        {!isReadOnly && (
          <button className="btn-create" onClick={openCreateModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Shop Type
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="empty-state">
          <p>Loading shop types...</p>
        </div>
      ) : isError ? (
        <div className="empty-state">
          <p>Unable to load shop types. Please try again.</p>
        </div>
      ) : shopTypes.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          <p>No shop types found.</p>
        </div>
      ) : (
        <div className="shop-types-grid">
          {shopTypes.map((shopType) => (
            <div
              key={shopType.id}
              className={`inventory-card${String(selectedShopTypeId) === String(shopType.id) ? " selected" : ""}`}
              onClick={() => onSelectShopType?.(shopType)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectShopType?.(shopType);
                }
              }}
              role={onSelectShopType ? "button" : undefined}
              tabIndex={onSelectShopType ? 0 : undefined}
            >
              <div className="card-top">
                <div className="card-icon-placeholder">
                  {shopType.image ? (
                    <img
                      src={shopType.image}
                      alt={shopType.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "inherit",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    shopType.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="card-title">{shopType.name}</h3>
                  <span className="card-badge shoptype">Shop Type</span>
                </div>
              </div>
              <div className="card-footer">
                <span>Status: <strong>{shopType.status}</strong></span>
                <span>{shopType.createdAt}</span>
              </div>
              {!isReadOnly && (
                <div className="actions-cell">
                  <button
                    type="button"
                    className="btn-action edit"
                    onClick={() => openEditModal(shopType)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-action delete"
                    onClick={() => handleDelete(shopType)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ModalPortal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingShopType ? "Edit Shop Type" : "Create New Shop Type"}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="shop-name">Shop Type Name *</label>
            <input
              id="shop-name"
              type="text"
              placeholder="e.g. Grocery, Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shop-image">
              Shop Type Image {editingShopType ? "" : "*"}
            </label>
            <input
              id="shop-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!editingShopType}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Shop type preview"
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
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Shop Type"}
            </button>
          </div>
        </form>
      </ModalPortal>
    </section>
  );
}
