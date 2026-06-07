import { useMemo, useState } from "react";
import ShopTypeSection from "../components/ShopTypeSection";
import {
  useGetAdminProductsByCategory,
  useGetCommonCategoriesByShopType,
  useGetShopTypes,
} from "../hooks/dashboardHooks";

export default function DashboardPage() {
  const {
    data: shopTypesResponse,
    isLoading: isShopTypesLoading,
    isError: isShopTypesError,
  } = useGetShopTypes();
  const [selectedShopType, setSelectedShopType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetCommonCategoriesByShopType(selectedShopType?.id);
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useGetAdminProductsByCategory(selectedCategory?.id);
  const [shopTypes, setShopTypes] = useState([]);
  const [shopTypeOverrides, setShopTypeOverrides] = useState({});
  const [deletedShopTypeIds, setDeletedShopTypeIds] = useState([]);

  const apiShopTypes = useMemo(() => {
    if (!shopTypesResponse?.data) return [];

    return shopTypesResponse.data.map((shopType) => ({
      id: shopType.shop_type_id,
      name: shopType.shop_type_name,
      image: shopType.shop_type_image,
      status: "Active",
      createdAt: "API",
    }));
  }, [shopTypesResponse]);

  const visibleShopTypes = useMemo(
    () =>
      [...apiShopTypes, ...shopTypes]
        .filter((shopType) => !deletedShopTypeIds.includes(shopType.id))
        .map((shopType) => ({
          ...shopType,
          ...(shopTypeOverrides[shopType.id] ?? {}),
        })),
    [apiShopTypes, deletedShopTypeIds, shopTypeOverrides, shopTypes],
  );

  const selectedCategories = useMemo(() => {
    if (!categoriesResponse?.data) return [];

    return categoriesResponse.data.map((category) => ({
      id: category.product_category_id,
      name: category.product_category_name,
      type: category.product_category_type,
      image: category.product_category_image,
      shopTypeId: category.shop_type_id,
      createdAt: "API",
    }));
  }, [categoriesResponse]);

  const selectedProducts = useMemo(() => {
    if (!productsResponse?.data) return [];

    return productsResponse.data.flatMap((categoryGroup) =>
      (categoryGroup.products ?? []).map((product) => {
        const mainImage =
          product.product_images?.find((image) => image.is_main === false) ??
          product.product_images?.find((image) => image.is_main === true) ??
          product.product_images?.[0];

        return {
          id: product.product_id,
          name: product.product_name,
          categoryId: categoryGroup.product_category_id,
          categoryName: selectedCategory?.name || "Uncategorized",
          shopTypeId: categoryGroup.shop_type_id,
          brandName: product.brand_name,
          price: product.product_price,
          productQuantity: product.product_quantity,
          quantityPrefix: product.quantity_prefix,
          productWeight: product.product_weight,
          weightPrefix: product.weight_prefix,
          description: product.product_description,
          image: mainImage?.url,
          productImages: product.product_images ?? [],
          availability: product.availability,
          type: product.product_type,
        };
      }),
    );
  }, [productsResponse, selectedCategory]);

  function handleSelectShopType(shopType) {
    setSelectedShopType(shopType);
    setSelectedCategory(null);
  }

  function handleAddShopType(newShopType) {
    setShopTypes((currentShopTypes) => [...currentShopTypes, newShopType]);
  }

  function handleUpdateShopType(updatedShopType) {
    setShopTypeOverrides((currentOverrides) => ({
      ...currentOverrides,
      [updatedShopType.id]: updatedShopType,
    }));
    setShopTypes((currentShopTypes) =>
      currentShopTypes.map((shopType) =>
        shopType.id === updatedShopType.id ? updatedShopType : shopType,
      ),
    );
  }

  function handleDeleteShopType(shopTypeId) {
    setDeletedShopTypeIds((currentIds) => [...currentIds, shopTypeId]);
    setShopTypes((currentShopTypes) =>
      currentShopTypes.filter((shopType) => shopType.id !== shopTypeId),
    );
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header-row">
        <div className="inventory-title-desc">
          <h1>Dashboard</h1>
          <p>Explore shop types</p>
        </div>
      </div>

      <ShopTypeSection
        shopTypes={visibleShopTypes}
        onAddShopType={handleAddShopType}
        onUpdateShopType={handleUpdateShopType}
        onDeleteShopType={handleDeleteShopType}
        isLoading={isShopTypesLoading}
        isError={isShopTypesError}
        isReadOnly
        onSelectShopType={handleSelectShopType}
        selectedShopTypeId={selectedShopType?.id}
      />

      {selectedShopType && (
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
              Product Categories - {selectedShopType.name}
            </h2>
          </div>

          {isCategoriesLoading ? (
            <div className="empty-state">
              <p>Loading product categories...</p>
            </div>
          ) : isCategoriesError ? (
            <div className="empty-state">
              <p>Unable to load product categories. Please try again.</p>
            </div>
          ) : selectedCategories.length === 0 ? (
            <div className="empty-state">
              <p>No product categories found.</p>
            </div>
          ) : (
            <div className="categories-grid">
              {selectedCategories.map((category) => (
                <div
                  key={category.id}
                  className={`inventory-card category-card${String(selectedCategory?.id) === String(category.id) ? " selected" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedCategory(category);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="category-card-main">
                    <div className="category-image-box">
                      {category.image ? (
                        <img src={category.image} alt={category.name} />
                      ) : (
                        category.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="category-card-copy">
                      <h3 className="card-title">{category.name}</h3>
                      <span className="card-badge category">
                        {category.type || "Category"}
                      </span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span>
                      Created: <strong>{category.createdAt}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedCategory && (
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
                <path d="M6 2l1.5 4L12 7.5 7.5 9 6 13 4.5 9 0 7.5 4.5 6 6 2z"></path>
                <path d="M18 8l1 2.5L22 12l-3 1.5-1 2.5-1-2.5L14 12l3-1.5L18 8z"></path>
                <path d="M10 16h10"></path>
                <path d="M10 20h6"></path>
              </svg>
              Products - {selectedCategory.name}
            </h2>
          </div>

          {isProductsLoading ? (
            <div className="empty-state">
              <p>Loading products...</p>
            </div>
          ) : isProductsError ? (
            <div className="empty-state">
              <p>Unable to load products. Please try again.</p>
            </div>
          ) : selectedProducts.length === 0 ? (
            <div className="empty-state">
              <p>No products found.</p>
            </div>
          ) : (
            <div className="products-grid">
              {selectedProducts.map((product) => {
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
                          {product.categoryName}
                        </span>
                      </div>
                      <div className="product-card-meta">
                        <span>
                          Quantity: <strong>{product.productQuantity}</strong>
                          {product.quantityPrefix && ` ${product.quantityPrefix}`}
                        </span>
                        <span>
                          Weight: <strong>{product.productWeight}</strong>
                          {product.weightPrefix && ` ${product.weightPrefix}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
