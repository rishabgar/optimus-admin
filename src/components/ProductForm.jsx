import { useState } from "react";
import ImageUploader from "./ImageUploader";

export default function ProductForm({
  shopTypes,
  categories,
  onShopTypeChange,
  onCategoryChange,
  onSubmit,
}) {
  const [prodShopTypeId, setProdShopTypeId] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodBrand, setProdBrand] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodWeight, setProdWeight] = useState("");
  const [prodWeightPrefix, setProdWeightPrefix] = useState("g");
  const [prodQtyPrefix, setProdQtyPrefix] = useState("pcs");
  const [prodStock, setProdStock] = useState("1");
  const [prodImgUrl, setProdImgUrl] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrescription, setProdPrescription] = useState(false);
  const [prodType, setProdType] = useState("common");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prodCategoryId || !prodName || !prodPrice || !prodBrand) return;

    onSubmit({
      shopTypeId: prodShopTypeId,
      categoryId: prodCategoryId,
      name: prodName,
      price: parseFloat(prodPrice),
      brand: prodBrand,
      weight: parseFloat(prodWeight) || undefined,
      weight_prefix: prodWeightPrefix,
      quantity_prefix: prodQtyPrefix,
      available_quantity: parseInt(prodStock) || 1,
      reserved_quantity: 0,
      availability: true,
      product_type: prodType,
      is_prescription_required: prodPrescription,
      description: prodDesc,
      images: prodImgUrl ? [{ url: prodImgUrl, alt: prodName }] : []
    });

    // Reset fields (except Shop Type / Category if user wants to add multiple items, but let's reset to keep it standard)
    setProdName("");
    setProdBrand("");
    setProdPrice("");
    setProdWeight("");
    setProdStock("1");
    setProdImgUrl("");
    setProdDesc("");
    setProdPrescription(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "0.85rem", width: "100%", maxWidth: "540px" }}>
      <h3 className="headline-sm" style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--outline-variant)", paddingBottom: "0.5rem" }}>
        Register New Product
      </h3>

      {/* Step A: Choose Shop Type */}
      <div>
        <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>1. Parent Shop Type</label>
        <select 
          value={prodShopTypeId}
          onChange={(e) => {
            const shopTypeId = e.target.value;
            setProdShopTypeId(shopTypeId);
            setProdCategoryId(""); // Reset cascading child selector
            onShopTypeChange(shopTypeId);
            onCategoryChange("");
          }}
          required
        >
          <option value="">-- Choose Shop Type --</option>
          {shopTypes.map(st => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>
      </div>

      {/* Step B: Choose Category (DYNAMICAL CASCADING FILTERING!) */}
      <div>
        <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>2. Product Category</label>
        <select 
          value={prodCategoryId}
          onChange={(e) => {
            const categoryId = e.target.value;
            setProdCategoryId(categoryId);
            onCategoryChange(categoryId);
          }}
          disabled={!prodShopTypeId}
          required
        >
          <option value="">
            {!prodShopTypeId ? "<- Select Shop Type first" : "-- Choose Category --"}
          </option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Product Name */}
      <div>
        <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>Product Name</label>
        <input 
          type="text" 
          placeholder="e.g. Cardioprotect 20mg" 
          value={prodName}
          onChange={(e) => setProdName(e.target.value)}
          required
        />
      </div>

      {/* Brand & Price */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "0.5rem" }}>
        <div>
          <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>Brand</label>
          <input 
            type="text" 
            placeholder="e.g. SynRx" 
            value={prodBrand}
            onChange={(e) => setProdBrand(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>Price (₹)</label>
          <input 
            type="number" 
            step="0.01" 
            placeholder="399" 
            value={prodPrice}
            onChange={(e) => setProdPrice(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Weights & Units Measurements */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 100px", gap: "0.5rem" }}>
        <div>
          <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>Weight</label>
          <input 
            type="number" 
            placeholder="350" 
            value={prodWeight}
            onChange={(e) => setProdWeight(e.target.value)}
          />
        </div>
        <div>
          <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>Weight Unit</label>
          <select value={prodWeightPrefix} onChange={(e) => setProdWeightPrefix(e.target.value)}>
            <option value="mg">mg</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
          </select>
        </div>
        <div>
          <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>Qty Unit</label>
          <select value={prodQtyPrefix} onChange={(e) => setProdQtyPrefix(e.target.value)}>
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="ltr">ltr</option>
          </select>
        </div>
      </div>

      {/* Stock, Type, and Image */}
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "0.85rem", alignItems: "end" }}>
        <div>
          <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>Stock</label>
          <input 
            type="number" 
            value={prodStock}
            onChange={(e) => setProdStock(e.target.value)}
            required
          />
        </div>
        <ImageUploader
          label="Product Image"
          onUploadSuccess={(path) => setProdImgUrl(path)}
        />
      </div>

      {/* Description */}
      <div>
        <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.3rem" }}>Description</label>
        <textarea 
          placeholder="Explain item attributes..." 
          value={prodDesc}
          onChange={(e) => setProdDesc(e.target.value)}
          rows={2}
          style={{ resize: "none" }}
        />
      </div>

      {/* Schema Flags (Prescription Upload & Type common/individual) */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "0.4rem 0" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem" }}>
          <input 
            type="checkbox" 
            checked={prodPrescription} 
            onChange={(e) => setProdPrescription(e.target.checked)}
            style={{ width: "16px", height: "16px" }}
          />
          <span>Prescription Required</span>
        </label>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--on-surface-variant)" }}>Type:</span>
          <select 
            value={prodType} 
            onChange={(e) => setProdType(e.target.value)}
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", width: "110px" }}
          >
            <option value="common">Common</option>
            <option value="individual">Individual</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.25rem" }}>
        Register Product
      </button>
    </form>
  );
}
