import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Layers,
  Tags,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  productService,
  categoryService,
  shopTypeService,
} from "../../services";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import ImageUpload from "../../components/common/ImageUpload";
import toast from "react-hot-toast";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [shopTypes, setShopTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter states
  const [selectedShopTypeId, setSelectedShopTypeId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      product_name: "",
      brand_name: "",
      product_description: "",
      shop_type_id: "",
      product_category_id: "",
      is_prescription_required: false,
      is_reward_product: false,
      reward_tokens_required: 0,
      product_image: "",
      variants: [
        {
          label: "Default",
          price: "",
          mrp: "",
          weight_value: "",
          weight_unit: "",
          discount_percent: "",
          product_quantity: "",
          available_quantity: "",
          is_default: true,
          is_active: true,
        },
      ],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const watchIsRewardProduct = watch("is_reward_product");
  const watchShopTypeId = watch("shop_type_id");

  // Load Shop Types & Categories for filters
  const loadFilterData = async () => {
    try {
      const shopRes = await shopTypeService.getAll();
      const payload = shopRes.data.data || [];
      setShopTypes(Array.isArray(payload) ? payload : payload.shopTypes || []);
    } catch (err) {
      console.error("Failed to load shop types", err);
    }
  };

  // Load Categories depending on selected shop type (for create/edit form)
  const loadFormCategories = async (shopTypeId) => {
    if (!shopTypeId) {
      setCategories([]);
      return;
    }
    try {
      const res = await categoryService.getByShopType(shopTypeId);
      const payload = res.data.data || [];
      setCategories(
        Array.isArray(payload) ? payload : payload.categories || [],
      );
    } catch (err) {
      console.error("Failed to load form categories", err);
    }
  };

  // Effect to load form categories when shop type changes in modal
  useEffect(() => {
    loadFormCategories(watchShopTypeId);
  }, [watchShopTypeId]);

  // Load Product list
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      let response;
      if (selectedCategoryId) {
        // Fetch products by category
        response = await productService.getByAdmin(selectedCategoryId, {
          page_no: currentPage,
        });
      } else {
        // Fetch all common products
        response = await productService.getCommon({
          page_no: currentPage,
        });
      }

      const payload = response.data.data || [];
      let list = [];

      if (Array.isArray(payload)) {
        list = payload;
        setTotalPages(1);
      } else if (payload.products) {
        list = payload.products;
        setTotalPages(payload.totalPages || 1);
      } else if (payload.data) {
        list = payload.data;
        setTotalPages(payload.totalPages || 1);
      }

      // If payload items have nested "productDetails" array (common schema matches from repository findCommonProducts)
      const mappedList = list
        .flatMap((item) => {
          if (item.productDetails && Array.isArray(item.productDetails)) {
            return item.productDetails.map((prod) => ({
              ...prod,
              product_category_id: item.product_category_id,
              shop_type_id: item.shop_type_id,
            }));
          }
          return [item];
        })
        .filter(Boolean);

      // Client side filtering for search query
      const filtered = mappedList.filter(
        (prod) =>
          (prod.product_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (prod.brand_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );

      setProducts(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategoryId, searchQuery]);

  // Load category filter list when shop type filter changes
  const [filterCategories, setFilterCategories] = useState([]);
  useEffect(() => {
    async function loadFilterCategories() {
      if (!selectedShopTypeId) {
        setFilterCategories([]);
        setSelectedCategoryId("");
        return;
      }
      try {
        const res = await categoryService.getByShopType(selectedShopTypeId);
        const payload = res.data.data || [];
        setFilterCategories(
          Array.isArray(payload) ? payload : payload.categories || [],
        );
        setSelectedCategoryId("");
      } catch (err) {
        console.error(err);
      }
    }
    loadFilterCategories();
  }, [selectedShopTypeId]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    reset({
      product_name: "",
      brand_name: "",
      product_description: "",
      shop_type_id: shopTypes[0]?.shop_type_id || "",
      product_category_id: "",
      is_prescription_required: false,
      is_reward_product: false,
      reward_tokens_required: 0,
      product_image: "",
      variants: [
        {
          label: "Default",
          price: "",
          mrp: "",
          sku: "SKU-" + Date.now().toString().slice(-6),
          weight_value: "",
          weight_unit: "",
          discount_percent: "",
          product_quantity: "",
          available_quantity: "",
          is_default: true,
          is_active: true,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);

    // Transform variants for editing form
    const formVariants = product.variants?.map((v) => ({
      label: v.label,
      price: v.price || "",
      mrp: v.mrp || "",
      sku: v.sku,
      weight_value: v.weight_value || "",
      weight_unit: v.weight_unit || "",
      discount_percent: v.discount_percent !== undefined ? v.discount_percent : "",
      product_quantity: v.product_quantity !== undefined ? v.product_quantity : "",
      available_quantity: v.available_quantity !== undefined ? v.available_quantity : "",
      is_default: v.is_default || false,
      is_active: v.is_active !== false,
    })) || [
      {
        label: "Default",
        price: "",
        mrp: "",
        sku: "",
        weight_value: "",
        weight_unit: "",
        discount_percent: "",
        product_quantity: "",
        available_quantity: "",
        is_default: true,
        is_active: true,
      },
    ];

    reset({
      product_name: product.product_name,
      brand_name: product.brand_name,
      product_description: product.product_description || "",
      shop_type_id: product.shop_type_id || "",
      product_category_id: product.product_category_id || "",
      is_prescription_required: product.is_prescription_required || false,
      is_reward_product: product.is_reward_product || false,
      reward_tokens_required: product.reward_tokens_required || 0,
      product_image: product.product_images?.[0]?.url || "",
      variants: formVariants,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setIsLoading(true);
    try {
      await productService.delete(id);
      toast.success("Product deleted successfully");
      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        // Build minimal patch payload
        const payload = { product_id: editingProduct._id };

        if (data.product_name !== editingProduct.product_name) {
          payload.product_name = data.product_name;
        }
        if (data.brand_name !== editingProduct.brand_name) {
          payload.brand_name = data.brand_name;
        }
        if (data.product_description !== (editingProduct.product_description || "")) {
          payload.product_description = data.product_description;
        }
        if (data.is_prescription_required !== editingProduct.is_prescription_required) {
          payload.is_prescription_required = data.is_prescription_required;
        }
        if (data.is_reward_product !== editingProduct.is_reward_product) {
          payload.is_reward_product = data.is_reward_product;
        }
        if (data.is_reward_product) {
          if (Number(data.reward_tokens_required) !== editingProduct.reward_tokens_required) {
            payload.reward_tokens_required = Number(data.reward_tokens_required);
          }
        }

        const origImage = editingProduct.product_images?.[0]?.url || "";
        const newImage = data.product_image || "";
        if (newImage !== origImage) {
          payload.product_images = newImage
            ? [{ url: newImage, alt: data.product_name, is_main: true }]
            : [];
        }

        const origVariants = editingProduct.variants || [];
        const origSkuSet = new Set(origVariants.map((v) => v.sku));
        const payloadVariants = [];

        data.variants.forEach((formVar) => {
          const isExisting = formVar.sku && origSkuSet.has(formVar.sku);

          if (isExisting) {
            const orig = origVariants.find((v) => v.sku === formVar.sku);
            const changedFields = {};
            let hasChanged = false;

            const compareNum = (formVal, origVal) => {
              const fNum =
                formVal !== "" && formVal !== undefined && formVal !== null
                  ? Number(formVal)
                  : undefined;
              const oNum =
                origVal !== undefined && origVal !== null
                  ? Number(origVal)
                  : undefined;
              return fNum === oNum;
            };

            const compareVal = (formVal, origVal) => {
              const fVal = formVal !== undefined ? formVal : "";
              const oVal = origVal !== undefined ? origVal : "";
              return String(fVal).trim() === String(oVal).trim();
            };

            if (!compareVal(formVar.label, orig.label)) {
              changedFields.label = formVar.label;
              hasChanged = true;
            }
            const weightValChanged = !compareNum(formVar.weight_value, orig.weight_value);
            const weightUnitChanged = !compareVal(formVar.weight_unit, orig.weight_unit);
            if (weightValChanged || weightUnitChanged) {
              changedFields.weight_value = Number(formVar.weight_value);
              changedFields.weight_unit = formVar.weight_unit;
              hasChanged = true;
            }
            if (!compareNum(formVar.price, orig.price)) {
              changedFields.price = Number(formVar.price);
              hasChanged = true;
            }
            if (!compareNum(formVar.mrp, orig.mrp)) {
              changedFields.mrp =
                formVar.mrp !== "" ? Number(formVar.mrp) : undefined;
              hasChanged = true;
            }
            if (!compareNum(formVar.discount_percent, orig.discount_percent)) {
              changedFields.discount_percent = Number(formVar.discount_percent);
              hasChanged = true;
            }
            if (!compareNum(formVar.product_quantity, orig.product_quantity)) {
              changedFields.product_quantity = Number(formVar.product_quantity);
              hasChanged = true;
            }
            if (!compareNum(formVar.available_quantity, orig.available_quantity)) {
              changedFields.available_quantity = Number(formVar.available_quantity);
              hasChanged = true;
            }
            if (formVar.is_default !== orig.is_default) {
              changedFields.is_default = formVar.is_default;
              hasChanged = true;
            }
            if (formVar.is_active !== orig.is_active) {
              changedFields.is_active = formVar.is_active;
              hasChanged = true;
            }


            if (hasChanged) {
              payloadVariants.push({
                sku: formVar.sku,
                ...changedFields,
              });
            }
          } else {
            // New variant (omit sku so backend generates it)
            const { sku, ...newVarFields } = formVar;
            payloadVariants.push({
              label: newVarFields.label,
              weight_value: newVarFields.weight_value
                ? Number(newVarFields.weight_value)
                : 0,
              weight_unit: newVarFields.weight_unit,
              price: newVarFields.price ? Number(newVarFields.price) : 0,
              mrp: newVarFields.mrp ? Number(newVarFields.mrp) : undefined,
              discount_percent: newVarFields.discount_percent
                ? Number(newVarFields.discount_percent)
                : 0,
              product_quantity: newVarFields.product_quantity
                ? Number(newVarFields.product_quantity)
                : 0,
              available_quantity: newVarFields.available_quantity
                ? Number(newVarFields.available_quantity)
                : 0,
              is_default: newVarFields.is_default || false,
              is_active: newVarFields.is_active !== false,
              sort_order: newVarFields.sort_order
                ? Number(newVarFields.sort_order)
                : 0,
            });
          }
        });

        if (payloadVariants.length > 0) {
          payload.variants = payloadVariants;
        }

        await productService.update(editingProduct._id, payload);
        toast.success("Product updated successfully");
      } else {
        // Transform product_image to array of objects
        const product_images = data.product_image
          ? [{ url: data.product_image, alt: data.product_name, is_main: true }]
          : [];

        const payload = {
          product_name: data.product_name,
          brand_name: data.brand_name,
          product_description: data.product_description,
          is_prescription_required: data.is_prescription_required,
          is_reward_product: data.is_reward_product,
          reward_tokens_required: data.is_reward_product
            ? Number(data.reward_tokens_required)
            : undefined,
          product_images,
          variants: data.variants.map((v) => ({
            ...v,
            price: v.price ? Number(v.price) : 0,
            mrp: v.mrp ? Number(v.mrp) : undefined,
            weight_value: v.weight_value ? Number(v.weight_value) : 0,
            discount_percent: v.discount_percent ? Number(v.discount_percent) : 0,
            product_quantity: v.product_quantity ? Number(v.product_quantity) : 0,
            available_quantity: v.available_quantity ? Number(v.available_quantity) : 0,
          })),
        };

        await productService.create({
          ...payload,
          shop_type_id: data.shop_type_id,
          product_category_id: data.product_category_id,
          product_type: "common",
        });
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  const getShopTypeName = (id) => {
    return (
      shopTypes.find((t) => t.shop_type_id === id)?.shop_type_name || "Common"
    );
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (row) => {
        const img = row.product_images?.[0]?.url;
        const imgUrl = img
          ? img.startsWith("http")
            ? img
            : `https://image.optimuskart.com/${img}`
          : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100";
        return (
          <img
            src={imgUrl}
            alt={row.product_name}
            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 animate-fade-in"
          />
        );
      },
    },
    {
      key: "product_name",
      label: "Product Details",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {row.product_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {row.brand_name}
          </p>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) => {
        const defaultVar =
          row.variants?.find((v) => v.is_default) || row.variants?.[0];
        return (
          <span className="font-medium text-gray-900 dark:text-white">
            {defaultVar ? `₹${defaultVar.price}` : "-"}
          </span>
        );
      },
    },
    {
      key: "stock",
      label: "Stock Availability",
      render: (row) => {
        const totalStock =
          row.variants?.reduce(
            (sum, v) => sum + (v.product_quantity || 0),
            0,
          ) || 0;
        const isOutOfStock = totalStock === 0;
        return (
          <span
            className={`badge ${isOutOfStock ? "badge-error" : "badge-success"}`}
          >
            {isOutOfStock ? "Out of Stock" : `${totalStock} Left`}
          </span>
        );
      },
    },
    {
      key: "type",
      label: "Shop / Category",
      render: (row) => (
        <div className="flex flex-col space-y-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
            {getShopTypeName(row.shop_type_id)}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products Catalogue
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage global common products, variants inventory, pricing tables
            and token redemptions.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary flex items-center justify-center space-x-2 shrink-0 shadow-md shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Common Product</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-lg shadow-sm">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by product or brand..."
            className="bg-transparent border-0 focus:outline-none w-full text-sm text-gray-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Shop Type Filter */}
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg shadow-sm">
          <Layers className="w-4 h-4 text-gray-400" />
          <select
            className="bg-transparent border-0 focus:outline-none text-sm text-gray-900 dark:text-white w-full"
            value={selectedShopTypeId}
            onChange={(e) => setSelectedShopTypeId(e.target.value)}
          >
            <option value="">All Shop Types</option>
            {shopTypes.map((type) => (
              <option key={type.shop_type_id} value={type.shop_type_id}>
                {type.shop_type_name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg shadow-sm">
          <Tags className="w-4 h-4 text-gray-400" />
          <select
            className="bg-transparent border-0 focus:outline-none text-sm text-gray-900 dark:text-white w-full"
            value={selectedCategoryId}
            disabled={!selectedShopTypeId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">All Categories</option>
            {filterCategories.map((cat) => (
              <option key={cat.product_category_id} value={cat.product_category_id}>
                {cat.product_category_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Listing */}
      <Table
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyMessage="No products catalogued"
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product Details" : "Add Common Product"}
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                className="input-field dark:input-field"
                placeholder="e.g. Organic Apple Juice"
                {...register("product_name", {
                  required: "Product name is required",
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                className="input-field dark:input-field"
                placeholder="e.g. Tropicana"
                {...register("brand_name", {
                  required: "Brand name is required",
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              className="input-field dark:input-field"
              placeholder="Provide a detailed description of the product..."
              {...register("product_description")}
            />
          </div>

          {!editingProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Shop Type
                </label>
                <select
                  className="input-field dark:input-field"
                  {...register("shop_type_id", {
                    required: "Shop type is required",
                  })}
                >
                  <option value="">Select Shop Type</option>
                  {shopTypes.map((t) => (
                    <option key={t.shop_type_id} value={t.shop_type_id}>
                      {t.shop_type_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category
                </label>
                <select
                  className="input-field dark:input-field"
                  disabled={!watchShopTypeId}
                  {...register("product_category_id", {
                    required: "Category is required",
                  })}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.product_category_id} value={c.product_category_id}>
                      {c.product_category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="prescription"
                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                {...register("is_prescription_required")}
              />
              <label
                htmlFor="prescription"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Prescription Required
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reward"
                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                {...register("is_reward_product")}
              />
              <label
                htmlFor="reward"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Reward/Redemption Item
              </label>
            </div>

            {watchIsRewardProduct && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Tokens Required
                </label>
                <input
                  type="number"
                  className="w-full px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                  {...register("reward_tokens_required", { min: 1 })}
                />
              </div>
            )}
          </div>

          <div>
            <Controller
              name="product_image"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  label="Product Primary Image"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Variants management */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Product Variants
              </h3>
              <button
                type="button"
                onClick={() =>
                  appendVariant({
                    label: "Size/Qty",
                    price: "",
                    mrp: "",
                    sku:
                      "SKU-" +
                      Math.random().toString(36).substr(2, 5).toUpperCase(),
                    weight_value: "",
                    weight_unit: "",
                    discount_percent: "",
                    product_quantity: "",
                    available_quantity: "",
                    is_default: false,
                    is_active: true,
                  })
                }
                className="flex items-center space-x-1.5 text-xs font-bold text-accent hover:underline"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {variantFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-gray-50 dark:bg-gray-800/20 p-3 rounded-lg border border-gray-100 dark:border-gray-700 relative"
                >
                  <input
                    type="hidden"
                    {...register(`variants.${index}.sku`, { required: true })}
                  />

                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="e.g. 500g, 1L"
                      {...register(`variants.${index}.label`, {
                        required: true,
                      })}
                    />
                  </div>

                  <div className="w-16">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Weight
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="Weight"
                      {...register(`variants.${index}.weight_value`, {
                        required: true,
                      })}
                    />
                  </div>

                  <div className="w-16">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Unit
                    </label>
                    <select
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                      {...register(`variants.${index}.weight_unit`, {
                        required: true,
                      })}
                    >
                      <option value="">Unit</option>
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="ltr">ltr</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </div>

                  <div className="w-16">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                      {...register(`variants.${index}.price`, {
                        required: true,
                      })}
                    />
                  </div>

                  <div className="w-16">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      MRP
                    </label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                      {...register(`variants.${index}.mrp`)}
                    />
                  </div>

                  <div className="w-16">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Disc %
                    </label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="0"
                      {...register(`variants.${index}.discount_percent`)}
                    />
                  </div>

                  <div className="w-16">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Tot Qty
                    </label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                      {...register(`variants.${index}.product_quantity`)}
                    />
                  </div>

                  <div className="w-16">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Avail Qty
                    </label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white"
                      {...register(`variants.${index}.available_quantity`)}
                    />
                  </div>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors mb-0.5 shrink-0"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </button>
             <button
              type="submit"
              disabled={isLoading}
              className="btn-primary shadow-md shadow-blue-500/10 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
