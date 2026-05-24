import { useState } from "react";
import ImageUploader from "./ImageUploader";

export default function CategoryForm({ shopTypes, onSubmit }) {
  const [catShopTypeId, setCatShopTypeId] = useState("");
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState("common");
  const [catImg, setCatImg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!catShopTypeId || !catName) return;
    onSubmit({
      shopTypeId: catShopTypeId,
      name: catName,
      type: catType,
      image: catImg,
    });
    setCatName("");
    setCatImg("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        maxWidth: "500px",
      }}
    >
      <h3
        className="headline-sm"
        style={{
          fontSize: "1.1rem",
          borderBottom: "1px solid var(--outline-variant)",
          paddingBottom: "0.5rem",
        }}
      >
        Create Product Category
      </h3>

      <div>
        <label
          className="label-md"
          style={{
            color: "var(--on-surface-variant)",
            display: "block",
            marginBottom: "0.4rem",
          }}
        >
          Select parent Shop Type
        </label>
        <select
          value={catShopTypeId}
          onChange={(e) => setCatShopTypeId(e.target.value)}
          required
        >
          <option value="">-- Choose Shop Type --</option>
          {shopTypes.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="label-md"
          style={{
            color: "var(--on-surface-variant)",
            display: "block",
            marginBottom: "0.4rem",
          }}
        >
          Category Name
        </label>
        <input
          type="text"
          placeholder="e.g. Organic Beverages"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          required
        />
      </div>

      <div>
        <label
          className="label-md"
          style={{
            color: "var(--on-surface-variant)",
            display: "block",
            marginBottom: "0.4rem",
          }}
        >
          Category Type
        </label>
        <select value={catType} onChange={(e) => setCatType(e.target.value)}>
          <option value="common">Common (Global)</option>
          <option value="individual">Individual (Custom)</option>
        </select>
      </div>

      <ImageUploader
        label="Category Image"
        onUploadSuccess={(path) => setCatImg(path)}
      />

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", marginTop: "0.5rem" }}
      >
        Add Category
      </button>
    </form>
  );
}
