import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ModalPortal({ isOpen, onClose, title, children }) {
  // Handle escape key press to close modal
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.warn("portal-root element not found in DOM, rendering inline.");
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content-wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>{title}</h3>
            <button
              className="btn-close-modal"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    );
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    portalRoot,
  );
}
