import { useState } from "react";
import axios from "axios";
import api from "../api/axios";

export default function ImageUploader({
  onUploadSuccess,
  currentUserId,
  label = "Upload Image",
}) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedPath, setUploadedPath] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    console.log(e.target.files[0]);
    const file = e.target.files[0];
    if (!file) return;

    // // Snappy instant client-side preview URL
    // setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setError("");

    // // Fallback standard user_id if currentUser object hasn't populated ID
    const userId = currentUserId || "69de6fff11fdb981a1af99c5";

    try {
      //   // 1. Call API to retrieve presigned PUT URL and target file path
      const response = await api.get(`upload/signed/url/${userId}`);
      // console.log(response);
      //   const { path, presignedUrl } = response.data?.data || {};
      //   if (!presignedUrl || !path) {
      //     throw new Error("Invalid presigned URL returned from server.");
      //   }
      //   // 2. Perform direct PUT upload to presigned URL using standard axios
      //   // Note: We MUST use standard axios here to prevent the Authorization Bearer token header
      //   // from being added, which would violate Cloudflare R2's signature constraints.
      //   await axios.put(presignedUrl, file, {
      //     headers: {
      //       "Content-Type": file.type,
      //     },
      //   });
      //   setUploadedPath(path);
      //   onUploadSuccess(path);
    } catch (err) {
      console.error("Image Upload Error:", err.message);
      // const errMsg =
      //   err.response?.data?.message || err.message || "Upload failed.";
      // setError(errMsg);
      // setPreviewUrl("");
      // setUploadedPath("");
    }
    // finally {
    //   setUploading(false);
    // }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label
        className="label-md"
        style={{ color: "var(--on-surface-variant)" }}
      >
        {label}
      </label>

      <div
        className="glass-panel"
        style={{
          border: "1px dashed var(--outline-variant)",
          borderRadius: "var(--radius-default)",
          padding: "1.5rem",
          textAlign: "center",
          background: "var(--surface-container-low)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          minHeight: "110px",
          transition: "all 0.2s ease",
        }}
      >
        {previewUrl ? (
          <div
            style={{
              position: "relative",
              width: "72px",
              height: "72px",
              borderRadius: "var(--radius-default)",
              overflow: "hidden",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  className="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: "var(--primary)",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  <line x1="12" x2="12" y1="2" y2="6" />
                  <line x1="12" x2="12" y1="18" y2="22" />
                  <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
                  <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
                  <line x1="2" x2="6" y1="12" y2="12" />
                  <line x1="18" x2="22" y1="12" y2="12" />
                  <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
                  <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--primary)" }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--on-surface-variant)",
                fontWeight: 500,
              }}
            >
              {uploading ? "Uploading..." : "Choose Image File"}
            </span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        />
      </div>

      {uploadedPath && !error && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--primary)",
            wordBreak: "break-all",
            marginTop: "0.2rem",
          }}
        >
          ✓ Uploaded: {uploadedPath}
        </span>
      )}

      {error && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--error)",
            marginTop: "0.2rem",
          }}
        >
          ✗ {error}
        </span>
      )}
    </div>
  );
}
