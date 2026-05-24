import { useEffect, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ShopTypeForm from "./components/ShopTypeForm";
import CategoryForm from "./components/CategoryForm";
import ProductForm from "./components/ProductForm";
import ImageUploader from "./components/ImageUploader";
import AuthPage from "./components/AuthPage";
import api from "./api/axios";

async function getAllShopTypes() {
  const res = await api.get("shop/type");
  return res.data;
}

async function getCategoriesByShopType(shopTypeId) {
  const res = await api.get(`categories/shop_type_id/${shopTypeId}`);
  return res.data;
}

async function getProductsByCategory(productCategoryId) {
  const res = await api.get(`product/admin/${productCategoryId}`);
  return res.data;
}

function getApiErrorMessage(error) {
  const message = error.response?.data?.message || error.message;
  return Array.isArray(message) ? message.join(", ") : message || "API failed.";
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse saved user from storage:", e);
      return null;
    }
  }); // Auth session gate
  const [selectedProfile, setSelectedProfile] = useState("seller");

  const [shopTypes, setShopTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryShopTypeId, setCategoryShopTypeId] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [apiLoadingCount, setApiLoadingCount] = useState(0);
  const [apiError, setApiError] = useState("");

  // Active Tab inside the Seller Dashboard Panel
  const [activeSellerTab, setActiveSellerTab] = useState("shopTypes");
  const isApiLoading = apiLoadingCount > 0;

  const startApiRequest = () => {
    setApiError("");
    setApiLoadingCount((count) => count + 1);
  };

  const finishApiRequest = () => {
    setApiLoadingCount((count) => Math.max(0, count - 1));
  };

  const showApiError = (context, error) => {
    setApiError(`${context}: ${getApiErrorMessage(error)}`);
  };

  const fetchShopTypes = async () => {
    startApiRequest();
    try {
      const shopTypesData = await getAllShopTypes();
      const normalizedShopTypes = (shopTypesData.data || []).map(
        (shopType) => ({
          id: shopType.id || shopType._id || shopType.shop_type_id,
          name: shopType.name || shopType.shop_type_name,
          image: shopType.image || shopType.shop_type_image,
        }),
      );
      setShopTypes(normalizedShopTypes);
    } catch (error) {
      console.error("Failed to fetch shop types:", error);
      showApiError("Failed to fetch shop types", error);
    } finally {
      finishApiRequest();
    }
  };

  useEffect(() => {
    const loadShopTypes = async () => {
      startApiRequest();
      try {
        const shopTypesData = await getAllShopTypes();
        const normalizedShopTypes = (shopTypesData.data || []).map(
          (shopType) => ({
            id: shopType.id || shopType._id || shopType.shop_type_id,
            name: shopType.name || shopType.shop_type_name,
            image: shopType.image || shopType.shop_type_image,
          }),
        );
        setShopTypes(normalizedShopTypes);
      } catch (error) {
        console.error("Failed to fetch shop types:", error);
        showApiError("Failed to fetch shop types", error);
      } finally {
        finishApiRequest();
      }
    };

    loadShopTypes();
  }, []);

  // Shop Type Dispatch Action
  const handleCreateShopType = async ({ name, image }) => {
    startApiRequest();
    try {
      const response = await api.post("shop/type/create", {
        shop_type_name: name.trim(),
        shop_type_image: image.trim(),
      });

      const createdShop = response.data?.data || response.data || {};
      const newShop = {
        id: createdShop.id || createdShop._id || `st-${Date.now()}`,
        name: createdShop.shop_type_name || name.trim(),
        image: createdShop.shop_type_image || image.trim(),
      };

      setShopTypes((prev) => [...prev, newShop]);
    } catch (err) {
      console.warn(
        "Failed to create Shop Type on backend, synchronizing locally...",
        err,
      );
      showApiError("Failed to create shop type", err);
      const newShop = {
        id: `st-${Date.now()}`,
        name: name.trim(),
        image: image.trim(),
      };
      setShopTypes((prev) => [...prev, newShop]);
    } finally {
      finishApiRequest();
    }
  };

  // Product Category Dispatch Action
  const handleCreateCategory = async ({ shopTypeId, name, type, image }) => {
    startApiRequest();
    try {
      const response = await api.post("categories/create", {
        shop_type_id: shopTypeId,
        product_category_name: name.trim(),
        product_category_type: type,
        product_category_image: image.trim(),
      });

      const createdCat = response.data?.data || response.data || {};
      const newCategory = {
        id: createdCat.id || createdCat._id || `cat-${Date.now()}`,
        shopTypeId: createdCat.shop_type_id || shopTypeId,
        name: createdCat.product_category_name || name.trim(),
        type: createdCat.product_category_type || type,
        image: createdCat.product_category_image || image.trim(),
      };

      setCategories((prev) => [...prev, newCategory]);
    } catch (err) {
      console.warn(
        "Failed to create Product Category on backend, synchronizing locally...",
        err,
      );
      showApiError("Failed to create product category", err);
      const newCategory = {
        id: `cat-${Date.now()}`,
        shopTypeId,
        name: name.trim(),
        type,
        image: image.trim(),
      };
      setCategories((prev) => [...prev, newCategory]);
    } finally {
      finishApiRequest();
    }
  };

  // Product Dispatch Action
  const handleGetCategoriesByShopType = async (shopTypeId) => {
    if (!shopTypeId) {
      setCategories([]);
      setProducts([]);
      return;
    }

    startApiRequest();
    try {
      const categoriesData = await getCategoriesByShopType(shopTypeId);
      const normalizedCategories = (categoriesData.data || []).map(
        (category) => ({
          id: category.id || category._id || category.product_category_id,
          shopTypeId: category.shop_type_id || shopTypeId,
          name: category.name || category.product_category_name,
          type: category.type || category.product_category_type,
          image: category.image || category.product_category_image,
        }),
      );
      setCategories(normalizedCategories);
      setProducts([]);
    } catch (error) {
      console.error("Failed to fetch categories by shop type:", error);
      showApiError("Failed to fetch categories", error);
    } finally {
      finishApiRequest();
    }
  };

  const handleGetProductsByCategory = async (productCategoryId) => {
    if (!productCategoryId) {
      setProducts([]);
      return;
    }

    startApiRequest();
    try {
      const productsData = await getProductsByCategory(productCategoryId);
      const productGroups = productsData.data || [];
      const apiProducts = productGroups.flatMap((group) =>
        (group.products || []).map((product) => ({
          ...product,
          product_category_id: group.product_category_id,
          shop_type_id: group.shop_type_id,
        })),
      );
      const normalizedProducts = apiProducts.map((product) => ({
        id: product.id || product._id || product.product_id,
        categoryId: product.product_category_id || productCategoryId,
        shopTypeId: product.shop_type_id,
        name: product.name || product.product_name,
        price: product.price || product.product_price,
        brand: product.brand || product.brand_name,
        weight: product.weight || product.product_weight,
        weight_prefix: product.weight_prefix,
        quantity_prefix: product.quantity_prefix,
        available_quantity:
          product.available_quantity || product.product_quantity,
        availability: product.availability,
        type: product.type || product.product_type,
        description: product.description || product.product_description,
        images: product.images || product.product_images || [],
      }));
      setProducts(normalizedProducts);
    } catch (error) {
      console.error("Failed to fetch products by category:", error);
      showApiError("Failed to fetch products", error);
    } finally {
      finishApiRequest();
    }
  };

  // Product Dispatch Action
  const handleCreateProduct = async (productData) => {
    startApiRequest();
    try {
      const finalImages = productData.images;

      const response = await api.post("product/admin/create", {
        product_name: productData.name.trim(),
        product_price: parseFloat(productData.price),
        product_weight: parseFloat(productData.weight) || undefined,
        product_description: productData.description,
        brand_name: productData.brand.trim(),
        product_category_id: productData.categoryId,
        availability: productData.availability,
        weight_prefix: productData.weight_prefix,
        product_quantity: parseInt(productData.available_quantity) || 1,
        quantity_prefix: productData.quantity_prefix,
        product_type: productData.product_type || "common",
        shop_type_id: productData.shopTypeId,
        product_images: finalImages,
      });

      const createdProd = response.data?.data || response.data || {};
      const newProduct = {
        id: createdProd.id || createdProd._id || `prod-${Date.now()}`,
        categoryId: createdProd.product_category_id || productData.categoryId,
        shopTypeId: createdProd.shop_type_id || productData.shopTypeId,
        name: createdProd.product_name || productData.name,
        price: createdProd.product_price || productData.price,
        brand: createdProd.brand_name || productData.brand,
        weight: createdProd.product_weight || productData.weight,
        weight_prefix: createdProd.weight_prefix || productData.weight_prefix,
        quantity_prefix:
          createdProd.quantity_prefix || productData.quantity_prefix,
        available_quantity:
          createdProd.product_quantity || productData.available_quantity,
        reserved_quantity: 0,
        availability: createdProd.availability ?? productData.availability,
        type: createdProd.product_type || productData.product_type,
        description: createdProd.product_description || productData.description,
        images: createdProd.product_images || finalImages,
      };

      setProducts((prev) => [...prev, newProduct]);
    } catch (err) {
      console.warn(
        "Failed to register Product on backend, synchronizing locally...",
        err,
      );
      showApiError("Failed to create product", err);
      const finalImages = productData.images;

      const newProduct = {
        id: `prod-${Date.now()}`,
        ...productData,
        images: finalImages,
      };
      setProducts((prev) => [...prev, newProduct]);
    } finally {
      finishApiRequest();
    }
  };

  const openEditModal = (kind, item) => {
    setEditingItem({ kind, id: item.id, original: item });
    setEditForm({
      ...item,
      image: item.image || item.images?.[0]?.url || "",
      imageAlt: item.images?.[0]?.alt || item.name || "",
    });
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    startApiRequest();
    try {
      if (editingItem.kind === "shopType") {
        await api.put(`shop/type/update/${editingItem.id}`, {
          shop_type_name: editForm.name.trim(),
          shop_type_image: editForm.image.trim(),
        });
        setShopTypes((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, name: editForm.name, image: editForm.image }
              : item,
          ),
        );
      }

      if (editingItem.kind === "category") {
        const original = editingItem.original;
        const categoryPayload = {
          product_category_id: editingItem.id,
        };

        if (editForm.name.trim() !== original.name) {
          categoryPayload.product_category_name = editForm.name.trim();
        }

        if ((editForm.image || "").trim() !== (original.image || "")) {
          categoryPayload.product_category_image = (editForm.image || "").trim();
        }

        await api.patch("categories/update", categoryPayload);
        setCategories((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  name: editForm.name,
                  image: editForm.image,
                }
              : item,
          ),
        );
      }

      if (editingItem.kind === "product") {
        const productImages = editForm.image
          ? [{ url: editForm.image, alt: editForm.imageAlt || editForm.name }]
          : [];

        await api.put(`product/admin/update/${editingItem.id}`, {
          product_name: editForm.name.trim(),
          product_price: parseFloat(editForm.price),
          product_weight: parseFloat(editForm.weight) || undefined,
          product_description: editForm.description,
          brand_name: editForm.brand.trim(),
          product_category_id: editForm.categoryId,
          availability: editForm.availability,
          weight_prefix: editForm.weight_prefix,
          product_quantity: parseInt(editForm.available_quantity) || 1,
          quantity_prefix: editForm.quantity_prefix,
          product_type: editForm.type,
          shop_type_id: editForm.shopTypeId,
          product_images: productImages,
        });
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, ...editForm, images: productImages }
              : item,
          ),
        );
      }

      closeEditModal();
    } catch (error) {
      console.error("Failed to update item:", error);
      showApiError("Failed to update item", error);
    } finally {
      finishApiRequest();
    }
  };

  const handleDeleteItem = async (kind, item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    startApiRequest();
    try {
      if (kind === "shopType") {
        await api.delete(`shop/type/delete/${item.id}`);
        setShopTypes((prev) =>
          prev.filter((shopType) => shopType.id !== item.id),
        );
      }

      if (kind === "category") {
        await api.delete("categories/delete", {
          data: { product_category_id: item.id },
        });
        setCategories((prev) =>
          prev.filter((category) => category.id !== item.id),
        );
      }

      if (kind === "product") {
        await api.delete(`product/admin/delete/${item.id}`);
        setProducts((prev) => prev.filter((product) => product.id !== item.id));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      showApiError("Failed to delete item", error);
    } finally {
      finishApiRequest();
    }
  };

  // Auth gate check
  if (!currentUser) {
    return (
      <AuthPage
        onAuthSuccess={(user) => {
          sessionStorage.setItem("user", JSON.stringify(user));
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="split-container">
      {isApiLoading && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 100,
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-default)",
            border: "1px solid var(--outline-variant)",
            background: "var(--surface-container-high)",
            color: "var(--on-surface)",
            fontWeight: 700,
          }}
        >
          Loading...
        </div>
      )}

      {apiError && (
        <div
          style={{
            position: "fixed",
            top: isApiLoading ? "4.25rem" : "1rem",
            right: "1rem",
            zIndex: 100,
            maxWidth: "420px",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-default)",
            border: "1px solid rgba(255, 180, 171, 0.35)",
            background: "var(--surface-container-high)",
            color: "var(--error)",
          }}
        >
          <span style={{ flex: 1 }}>{apiError}</span>
          <button
            type="button"
            onClick={() => setApiError("")}
            style={{
              border: 0,
              background: "transparent",
              color: "var(--error)",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            X
          </button>
        </div>
      )}

      <PanelGroup direction="horizontal">
        {/* LEFT COLUMN: Sidebar Navigation Profile Selection */}
        <Panel
          defaultSize={26}
          minSize={20}
          maxSize={40}
          className="left-sidebar"
        >
          {/* Dashboard Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Optimus<span className="text-gradient">Kart</span>
            </h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--on-surface-variant)",
                marginTop: "0.4rem",
                lineHeight: "1.4",
                marginBottom: "1.25rem",
              }}
            >
              Workspace Management Hub. Select an actor portal node from below
              to configure workspaces.
            </p>

            {/* Active User Profile Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
                borderRadius: "var(--radius-default)",
                marginTop: "1.25rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {currentUser.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--primary)" }}>
                  {currentUser.role}
                </div>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem("token");
                  sessionStorage.removeItem("user");
                  setCurrentUser(null);
                }}
                className="btn"
                style={{
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.75rem",
                  border: "1px solid var(--outline-variant)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--error)",
                  borderColor: "rgba(255, 180, 171, 0.2)",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Dynamic Selection List */}
          <div style={{ flex: 1 }}>
            {/* Option 1: Customer */}
            <button
              className={`selector-card ${selectedProfile === "customer" ? "active" : ""}`}
              onClick={() => setSelectedProfile("customer")}
            >
              <div className="selector-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  Customer
                </h4>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--on-surface-variant)",
                    marginTop: "0.15rem",
                  }}
                >
                  Manage catalogs & cart checkouts
                </p>
              </div>
            </button>

            {/* Option 2: Seller */}
            <button
              className={`selector-card ${selectedProfile === "seller" ? "active" : ""}`}
              onClick={() => setSelectedProfile("seller")}
            >
              <div className="selector-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Seller</h4>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--on-surface-variant)",
                    marginTop: "0.15rem",
                  }}
                >
                  Configure hierarchical models & products
                </p>
              </div>
            </button>

            {/* Option 3: Delivery Boy */}
            <button
              className={`selector-card ${selectedProfile === "delivery" ? "active" : ""}`}
              onClick={() => setSelectedProfile("delivery")}
            >
              <div className="selector-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="16" height="12" x="2" y="6" rx="2" />
                  <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" x2="12" y1="12" y2="12" />
                  <line x1="8" x2="16" y1="16" y2="16" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  Delivery Boy
                </h4>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--on-surface-variant)",
                    marginTop: "0.15rem",
                  }}
                >
                  Track dispatches & timelines
                </p>
              </div>
            </button>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--on-surface-variant)",
              }}
            >
              OptimusKart Workspace v2.0
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--primary)",
                fontWeight: 600,
              }}
            >
              Active font: Geist & Hanken Grotesk
            </span>
          </div>
        </Panel>

        {/* Resizable Divider Drag Handle */}
        <PanelResizeHandle className="resize-handle" />

        {/* RIGHT COLUMN: Selected Workspace Display */}
        <Panel>
          <div className="right-screen">
            {/* PROFILE 1: CUSTOMER VIEW */}
            {selectedProfile === "customer" && (
              <div
                className="animate-fade"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "3rem", filter: "grayscale(20%)" }}>
                  🛒
                </div>
                <h2 className="headline-md">Customer Management Node</h2>
                <p className="body-md" style={{ maxWidth: "450px" }}>
                  This is a secure workspace segment designed for user account
                  profiles, shipping rosters, and order payment details. Add
                  custom components to display customer profiles here.
                </p>
              </div>
            )}

            {/* PROFILE 2: SELLER REGISTRY VIEW (THE FLOW: SHOP TYPE ➡️ CATEGORY ➡️ PRODUCTS) */}
            {selectedProfile === "seller" && (
              <div
                className="animate-fade"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  minHeight: "100%",
                }}
              >
                {/* Header Title */}
                <div>
                  <span
                    className="label-md"
                    style={{ color: "var(--primary)" }}
                  >
                    Registry Console
                  </span>
                  <h1 className="headline-md" style={{ marginTop: "0.25rem" }}>
                    Hierarchical Catalog Manager
                  </h1>
                  <p className="body-md" style={{ marginTop: "0.4rem" }}>
                    Add products systematically: First build a **Shop Type**,
                    link a **Product Category** inside it, and finally register
                    **Products** under your category.
                  </p>
                </div>

                {/* Sub-tab Selection Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    borderBottom: "1px solid var(--outline-variant)",
                    paddingBottom: "0.75rem",
                  }}
                >
                  <button
                    onClick={() => setActiveSellerTab("shopTypes")}
                    className="btn"
                    style={{
                      backgroundColor:
                        activeSellerTab === "shopTypes"
                          ? "var(--primary)"
                          : "transparent",
                      color:
                        activeSellerTab === "shopTypes"
                          ? "var(--on-primary)"
                          : "var(--on-surface)",
                      borderColor:
                        activeSellerTab === "shopTypes"
                          ? "var(--primary)"
                          : "var(--outline-variant)",
                      borderWidth: "1px",
                    }}
                  >
                    1. Shop Types ({shopTypes.length})
                  </button>
                  <button
                    onClick={() => setActiveSellerTab("categories")}
                    className="btn"
                    style={{
                      backgroundColor:
                        activeSellerTab === "categories"
                          ? "var(--primary)"
                          : "transparent",
                      color:
                        activeSellerTab === "categories"
                          ? "var(--on-primary)"
                          : "var(--on-surface)",
                      borderColor:
                        activeSellerTab === "categories"
                          ? "var(--primary)"
                          : "var(--outline-variant)",
                      borderWidth: "1px",
                    }}
                  >
                    2. Product Categories ({categories.length})
                  </button>
                  <button
                    onClick={() => setActiveSellerTab("products")}
                    className="btn"
                    style={{
                      backgroundColor:
                        activeSellerTab === "products"
                          ? "var(--primary)"
                          : "transparent",
                      color:
                        activeSellerTab === "products"
                          ? "var(--on-primary)"
                          : "var(--on-surface)",
                      borderColor:
                        activeSellerTab === "products"
                          ? "var(--primary)"
                          : "var(--outline-variant)",
                      borderWidth: "1px",
                    }}
                  >
                    3. Products ({products.length})
                  </button>
                </div>

                {/* TAB CONTAINER 1: SHOP TYPES */}
                {activeSellerTab === "shopTypes" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1rem",
                      width: "100%",
                    }}
                  >
                    <ShopTypeForm onSubmit={handleCreateShopType} />
                    <div
                      className="glass-panel"
                      style={{
                        width: "100%",
                        maxWidth: "720px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          alignItems: "center",
                        }}
                      >
                        <h3
                          className="headline-sm"
                          style={{ fontSize: "1.1rem" }}
                        >
                          Shop Types
                        </h3>
                        <button
                          type="button"
                          className="btn"
                          onClick={fetchShopTypes}
                          style={{
                            border: "1px solid var(--outline-variant)",
                          }}
                        >
                          Refresh
                        </button>
                      </div>

                      {shopTypes.map((shopType) => (
                        <div
                          key={shopType.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "52px 1fr auto",
                            gap: "0.75rem",
                            alignItems: "center",
                            padding: "0.75rem",
                            border: "1px solid var(--outline-variant)",
                            borderRadius: "var(--radius-default)",
                          }}
                        >
                          <div
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "var(--radius-default)",
                              overflow: "hidden",
                              background: "var(--surface-container-low)",
                            }}
                          >
                            {shopType.image && (
                              <img
                                src={shopType.image}
                                alt={shopType.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {shopType.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--on-surface-variant)",
                                wordBreak: "break-all",
                              }}
                            >
                              {shopType.id}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              type="button"
                              className="btn"
                              onClick={() =>
                                openEditModal("shopType", shopType)
                              }
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn"
                              onClick={() =>
                                handleDeleteItem("shopType", shopType)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTAINER 2: CATEGORIES */}
                {activeSellerTab === "categories" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1rem",
                      width: "100%",
                    }}
                  >
                    <CategoryForm
                      shopTypes={shopTypes}
                      onSubmit={handleCreateCategory}
                    />
                    <div
                      className="glass-panel"
                      style={{
                        width: "100%",
                        maxWidth: "720px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <h3
                        className="headline-sm"
                        style={{ fontSize: "1.1rem" }}
                      >
                        Product Categories
                      </h3>
                      <select
                        value={categoryShopTypeId}
                        onChange={(e) => {
                          const shopTypeId = e.target.value;
                          setCategoryShopTypeId(shopTypeId);
                          handleGetCategoriesByShopType(shopTypeId);
                        }}
                      >
                        <option value="">-- Choose Shop Type --</option>
                        {shopTypes.map((shopType) => (
                          <option key={shopType.id} value={shopType.id}>
                            {shopType.name}
                          </option>
                        ))}
                      </select>

                      {categories.map((category) => (
                        <div
                          key={category.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "52px 1fr",
                            gap: "0.75rem",
                            alignItems: "center",
                            padding: "0.75rem",
                            border: "1px solid var(--outline-variant)",
                            borderRadius: "var(--radius-default)",
                          }}
                        >
                          <div
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "var(--radius-default)",
                              overflow: "hidden",
                              background: "var(--surface-container-low)",
                            }}
                          >
                            {category.image && (
                              <img
                                src={category.image}
                                alt={category.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {category.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--on-surface-variant)",
                              }}
                            >
                              {category.type}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              type="button"
                              className="btn"
                              onClick={() =>
                                openEditModal("category", category)
                              }
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn"
                              onClick={() =>
                                handleDeleteItem("category", category)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTAINER 3: PRODUCTS REGISTRY */}
                {activeSellerTab === "products" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1rem",
                      width: "100%",
                    }}
                  >
                    <ProductForm
                      shopTypes={shopTypes}
                      categories={categories}
                      onShopTypeChange={handleGetCategoriesByShopType}
                      onCategoryChange={handleGetProductsByCategory}
                      onSubmit={handleCreateProduct}
                    />
                    <div
                      className="glass-panel"
                      style={{
                        width: "100%",
                        maxWidth: "720px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <h3
                        className="headline-sm"
                        style={{ fontSize: "1.1rem" }}
                      >
                        Products
                      </h3>
                      {products.length === 0 ? (
                        <div
                          style={{
                            color: "var(--on-surface-variant)",
                            fontSize: "0.85rem",
                          }}
                        >
                          Select a product category above to load products.
                        </div>
                      ) : (
                        products.map((product) => (
                          <div
                            key={product.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr auto auto",
                              gap: "0.75rem",
                              alignItems: "center",
                              padding: "0.75rem",
                              border: "1px solid var(--outline-variant)",
                              borderRadius: "var(--radius-default)",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700 }}>
                                {product.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--on-surface-variant)",
                                }}
                              >
                                {product.brand}
                              </div>
                            </div>
                            <div style={{ fontWeight: 700 }}>
                              {product.price}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                type="button"
                                className="btn"
                                onClick={() =>
                                  openEditModal("product", product)
                                }
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn"
                                onClick={() =>
                                  handleDeleteItem("product", product)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE 3: DELIVERY BOY VIEW */}
            {selectedProfile === "delivery" && (
              <div
                className="animate-fade"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "3rem", filter: "grayscale(20%)" }}>
                  📦
                </div>
                <h2 className="headline-md">Delivery Boy Dispatch Node</h2>
                <p className="body-md" style={{ maxWidth: "450px" }}>
                  This is a secure workspace segment designed for package
                  transit logs, timelines, and routes maps. Add custom
                  components to display tracking timelines here.
                </p>
              </div>
            )}

            {editingItem && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.65)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                  zIndex: 50,
                }}
                onClick={closeEditModal}
              >
                <form
                  onSubmit={handleUpdateItem}
                  className="glass-panel"
                  style={{
                    width: "100%",
                    maxWidth: "620px",
                    maxHeight: "85vh",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <h3 className="headline-sm" style={{ fontSize: "1.2rem" }}>
                      Edit{" "}
                      {editingItem.kind === "shopType"
                        ? "Shop Type"
                        : editingItem.kind === "category"
                          ? "Product Category"
                          : "Product"}
                    </h3>
                    <button
                      type="button"
                      className="btn"
                      onClick={closeEditModal}
                      style={{ border: "1px solid var(--outline-variant)" }}
                    >
                      Close
                    </button>
                  </div>

                  {editForm.image && (
                    <img
                      src={editForm.image}
                      alt={editForm.imageAlt || editForm.name}
                      style={{
                        width: "100%",
                        maxHeight: "220px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-default)",
                        border: "1px solid var(--outline-variant)",
                      }}
                    />
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <label>
                      <span className="label-md">Name</span>
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          handleEditFormChange("name", e.target.value)
                        }
                        required
                      />
                    </label>

                    {editingItem.kind === "product" && (
                      <label>
                        <span className="label-md">Brand</span>
                        <input
                          type="text"
                          value={editForm.brand || ""}
                          onChange={(e) =>
                            handleEditFormChange("brand", e.target.value)
                          }
                          required
                        />
                      </label>
                    )}

                    {editingItem.kind === "product" && (
                      <label>
                        <span className="label-md">Type</span>
                        <select
                          value={editForm.type || "common"}
                          onChange={(e) =>
                            handleEditFormChange("type", e.target.value)
                          }
                        >
                          <option value="common">Common</option>
                          <option value="individual">Individual</option>
                        </select>
                      </label>
                    )}

                    {editingItem.kind === "product" && (
                      <>
                        <label>
                          <span className="label-md">Price</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.price || ""}
                            onChange={(e) =>
                              handleEditFormChange("price", e.target.value)
                            }
                            required
                          />
                        </label>
                        <label>
                          <span className="label-md">Weight</span>
                          <input
                            type="number"
                            value={editForm.weight || ""}
                            onChange={(e) =>
                              handleEditFormChange("weight", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span className="label-md">Weight Unit</span>
                          <select
                            value={editForm.weight_prefix || "g"}
                            onChange={(e) =>
                              handleEditFormChange(
                                "weight_prefix",
                                e.target.value,
                              )
                            }
                          >
                            <option value="mg">mg</option>
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                          </select>
                        </label>
                        <label>
                          <span className="label-md">Quantity</span>
                          <input
                            type="number"
                            value={editForm.available_quantity || ""}
                            onChange={(e) =>
                              handleEditFormChange(
                                "available_quantity",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </label>
                        <label>
                          <span className="label-md">Quantity Unit</span>
                          <select
                            value={editForm.quantity_prefix || "pcs"}
                            onChange={(e) =>
                              handleEditFormChange(
                                "quantity_prefix",
                                e.target.value,
                              )
                            }
                          >
                            <option value="pcs">pcs</option>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="ltr">ltr</option>
                          </select>
                        </label>
                        <label>
                          <span className="label-md">Availability</span>
                          <select
                            value={editForm.availability ? "true" : "false"}
                            onChange={(e) =>
                              handleEditFormChange(
                                "availability",
                                e.target.value === "true",
                              )
                            }
                          >
                            <option value="true">Available</option>
                            <option value="false">Unavailable</option>
                          </select>
                        </label>
                      </>
                    )}
                  </div>

                  {editingItem.kind === "product" && (
                    <label>
                      <span className="label-md">Description</span>
                      <textarea
                        value={editForm.description || ""}
                        onChange={(e) =>
                          handleEditFormChange("description", e.target.value)
                        }
                        rows={3}
                      />
                    </label>
                  )}

                  <ImageUploader
                    label="Update Image"
                    onUploadSuccess={(path) =>
                      handleEditFormChange("image", path)
                    }
                  />

                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
