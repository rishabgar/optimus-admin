import { useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ShopTypeForm from "./components/ShopTypeForm";
import CategoryForm from "./components/CategoryForm";
import ProductForm from "./components/ProductForm";
import AuthPage from "./components/AuthPage";
import api from "./api/axios";

// const INITIAL_SHOP_TYPES = [
//   {
//     id: "st-1",
//     name: "Grocery Supermarket",
//     image:
//       "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60",
//   },
//   {
//     id: "st-2",
//     name: "Tech & Gadget Hub",
//     image:
//       "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=80&auto=format&fit=crop&q=60",
//   },
//   {
//     id: "st-3",
//     name: "Apex Pharmacy",
//     image:
//       "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=80&auto=format&fit=crop&q=60",
//   },
// ];

// const INITIAL_CATEGORIES = [
//   // Grocery categories
//   {
//     id: "cat-1",
//     shopTypeId: "st-1",
//     name: "Fresh Fruits & Veg",
//     type: "common",
//     image:
//       "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=80&auto=format&fit=crop&q=60",
//   },
//   {
//     id: "cat-2",
//     shopTypeId: "st-1",
//     name: "Organic Beverages",
//     type: "common",
//     image:
//       "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=80&auto=format&fit=crop&q=60",
//   },
//   // Tech categories
//   {
//     id: "cat-3",
//     shopTypeId: "st-2",
//     name: "Acoustics & Audio",
//     type: "common",
//     image:
//       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=60",
//   },
//   {
//     id: "cat-4",
//     shopTypeId: "st-2",
//     name: "Wearables & Watches",
//     type: "individual",
//     image:
//       "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&auto=format&fit=crop&q=60",
//   },
//   // Pharmacy categories
//   {
//     id: "cat-5",
//     shopTypeId: "st-3",
//     name: "OTC Medications",
//     type: "common",
//     image:
//       "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=80&auto=format&fit=crop&q=60",
//   },
//   {
//     id: "cat-6",
//     shopTypeId: "st-3",
//     name: "Prescription Drugs",
//     type: "individual",
//     image:
//       "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=80&auto=format&fit=crop&q=60",
//   },
// ];

// const INITIAL_PRODUCTS = [
//   // Fruits category
//   {
//     id: "prod-1",
//     categoryId: "cat-1",
//     name: "Organic Honeycrisp Apples",
//     price: 4.99,
//     brand: "BioFarms",
//     weight: 1,
//     weight_prefix: "kg",
//     quantity_prefix: "kg",
//     available_quantity: 42,
//     reserved_quantity: 2,
//     availability: true,
//     type: "common",
//     description:
//       "Crispy, sweet organic honeycrisp apples sourced from local orchards.",
//     is_prescription_required: false,
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=120&auto=format&fit=crop&q=60",
//         is_main: true,
//       },
//     ],
//   },
//   // Audio category
//   {
//     id: "prod-2",
//     categoryId: "cat-3",
//     name: "NovaCore Hybrid Headphones",
//     price: 329.0,
//     brand: "NovaCore",
//     weight: 350,
//     weight_prefix: "g",
//     quantity_prefix: "pcs",
//     available_quantity: 12,
//     reserved_quantity: 0,
//     availability: true,
//     type: "common",
//     description:
//       "Active noise-cancelling studio headphones with dynamic carbon dome drivers.",
//     is_prescription_required: false,
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=60",
//         is_main: true,
//       },
//     ],
//   },
//   // Prescription drugs category
//   {
//     id: "prod-3",
//     categoryId: "cat-6",
//     name: "LipoSync Cardioprotect",
//     price: 89.99,
//     brand: "SynRx Laboratories",
//     weight: 20,
//     weight_prefix: "mg",
//     quantity_prefix: "pcs",
//     available_quantity: 8,
//     reserved_quantity: 1,
//     availability: true,
//     type: "individual",
//     description:
//       "Statins cardiovascular therapy. Strictly requires doctor uploads.",
//     is_prescription_required: true,
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=120&auto=format&fit=crop&q=60",
//         is_main: true,
//       },
//     ],
//   },
// ];

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

  // Active Tab inside the Seller Dashboard Panel
  const [activeSellerTab, setActiveSellerTab] = useState("shopTypes");

  // Shop Type Dispatch Action
  const handleCreateShopType = async ({ name, image }) => {
    try {
      const response = await api.post("shop/type/create", {
        shop_type_name: name.trim(),
        shop_type_image: image.trim() || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80",
      });

      const createdShop = response.data?.data || response.data || {};
      const newShop = {
        id: createdShop.id || createdShop._id || `st-${Date.now()}`,
        name: createdShop.shop_type_name || name.trim(),
        image: createdShop.shop_type_image || image.trim(),
      };

      setShopTypes(prev => [...prev, newShop]);
    } catch (err) {
      console.warn("Failed to create Shop Type on backend, synchronizing locally...", err);
      const newShop = {
        id: `st-${Date.now()}`,
        name: name.trim(),
        image: image.trim() || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80",
      };
      setShopTypes(prev => [...prev, newShop]);
    }
  };

  // Product Category Dispatch Action
  const handleCreateCategory = async ({ shopTypeId, name, type, image }) => {
    try {
      const response = await api.post("product/category/create", {
        shop_type_id: shopTypeId,
        product_category_name: name.trim(),
        product_category_type: type,
        product_category_image: image.trim() || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=80",
      });

      const createdCat = response.data?.data || response.data || {};
      const newCategory = {
        id: createdCat.id || createdCat._id || `cat-${Date.now()}`,
        shopTypeId: createdCat.shop_type_id || shopTypeId,
        name: createdCat.product_category_name || name.trim(),
        type: createdCat.product_category_type || type,
        image: createdCat.product_category_image || image.trim(),
      };

      setCategories(prev => [...prev, newCategory]);
    } catch (err) {
      console.warn("Failed to create Product Category on backend, synchronizing locally...", err);
      const newCategory = {
        id: `cat-${Date.now()}`,
        shopTypeId,
        name: name.trim(),
        type,
        image: image.trim() || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=80",
      };
      setCategories(prev => [...prev, newCategory]);
    }
  };

  // Product Dispatch Action
  const handleCreateProduct = async (productData) => {
    try {
      const finalImages = productData.images.length > 0
        ? productData.images
        : [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120", is_main: true }];

      const response = await api.post("product/create", {
        product_name: productData.name.trim(),
        product_category_id: productData.categoryId,
        product_images: finalImages,
        product_price: parseFloat(productData.price),
        product_brand: productData.brand.trim(),
        product_weight: parseFloat(productData.weight) || undefined,
        product_weight_prefix: productData.weight_prefix,
        product_quantity_prefix: productData.quantity_prefix,
        product_available_quantity: parseInt(productData.available_quantity) || 1,
        product_type: productData.product_type || "common",
        is_prescription_required: productData.is_prescription_required || false,
        product_description: productData.description?.trim(),
      });

      const createdProd = response.data?.data || response.data || {};
      const newProduct = {
        id: createdProd.id || createdProd._id || `prod-${Date.now()}`,
        categoryId: createdProd.product_category_id || productData.categoryId,
        name: createdProd.product_name || productData.name,
        price: createdProd.product_price || productData.price,
        brand: createdProd.product_brand || productData.brand,
        weight: createdProd.product_weight || productData.weight,
        weight_prefix: createdProd.product_weight_prefix || productData.weight_prefix,
        quantity_prefix: createdProd.product_quantity_prefix || productData.quantity_prefix,
        available_quantity: createdProd.product_available_quantity || productData.available_quantity,
        reserved_quantity: 0,
        availability: true,
        type: createdProd.product_type || productData.product_type,
        description: createdProd.product_description || productData.description,
        images: createdProd.product_images || finalImages,
      };

      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.warn("Failed to register Product on backend, synchronizing locally...", err);
      const finalImages = productData.images.length > 0
        ? productData.images
        : [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120", is_main: true }];

      const newProduct = {
        id: `prod-${Date.now()}`,
        ...productData,
        images: finalImages,
      };
      setProducts(prev => [...prev, newProduct]);
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
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <ShopTypeForm onSubmit={handleCreateShopType} />
                  </div>
                )}

                {/* TAB CONTAINER 2: CATEGORIES */}
                {activeSellerTab === "categories" && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <CategoryForm
                      shopTypes={shopTypes}
                      onSubmit={handleCreateCategory}
                    />
                  </div>
                )}

                {/* TAB CONTAINER 3: PRODUCTS REGISTRY */}
                {activeSellerTab === "products" && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <ProductForm
                      shopTypes={shopTypes}
                      categories={categories}
                      onSubmit={handleCreateProduct}
                    />
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
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
