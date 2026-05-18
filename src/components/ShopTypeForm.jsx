import React, { useState } from "react";
import ImageUploader from "./ImageUploader";

export default function ShopTypeForm({ onSubmit }) {
  const [shopName, setShopName] = useState("");
  const [shopImg, setShopImg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shopName) return;
    onSubmit({ name: shopName, image: shopImg });
    setShopName("");
    setShopImg("");
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "500px" }}>
      <h3 className="headline-sm" style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--outline-variant)", paddingBottom: "0.5rem" }}>
        Create Shop Type
      </h3>

      <div>
        <label className="label-md" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "0.4rem" }}>Shop Type Name</label>
        <input 
          type="text" 
          placeholder="e.g. Organic Supermarket" 
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          required
        />
      </div>

      <ImageUploader
        label="Shop Type Image"
        onUploadSuccess={(path) => setShopImg(path)}
      />

      <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
        Add Shop Type
      </button>
    </form>
  );
}
