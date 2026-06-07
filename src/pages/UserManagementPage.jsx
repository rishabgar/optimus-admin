import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalPortal from "../components/ModalPortal";
import UserRow from "../components/UserRow";
import { useGetUser } from "../hooks/useGetUser";

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("customer");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [formError, setFormError] = useState("");
  const {
    data: responseData,
    isLoading,
    isError,
    error,
  } = useGetUser(activeTab);

  const users = responseData?.data ?? [];

  function handleSave(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    setFormError("Save API is not connected yet.");
  }

  function handleDelete() {
    alert("Delete API is not connected yet.");
  }

  function handleExpandSeller(sellerId) {
    navigate(`/inventory-service?sellerId=${sellerId}`);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setName(`${user.first_name} ${user.last_name ?? ""}`);
    setEmail(user.user_email);
    setRole(user.user_type);
    setFormError("");
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole(activeTab);
    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("customer");
    setFormError("");
  }

  function renderUsersContent() {
    if (isLoading) {
      return (
        <div className="empty-state">
          <p>Loading {activeTab} users...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="empty-state">
          <p>{error?.message || "Unable to load users. Please try again."}</p>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p>No {activeTab} users found.</p>
        </div>
      );
    }

    return (
      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user._id}
                user={user}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onExpand={handleExpandSeller}
                isSellerTab={activeTab === "seller"}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="usermanagement-container">
      <div className="usermanagement-header">
        <div className="usermanagement-title-desc">
          <h1>User Management</h1>
          <p>
            Manage and audit customers and registered sellers in the workspace.
          </p>
        </div>

        <button className="btn-create" onClick={openCreateModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create User
        </button>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "customer" ? "active" : ""}`}
          onClick={() => setActiveTab("customer")}
        >
          Customers
        </button>
        <button
          className={`tab-btn ${activeTab === "seller" ? "active" : ""}`}
          onClick={() => setActiveTab("seller")}
        >
          Sellers
        </button>
      </div>

      <div className="users-list-card">{renderUsersContent()}</div>

      <ModalPortal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? "Edit User Profile" : "Create New User"}
      >
        <form onSubmit={handleSave} className="modal-form">
          {formError && <p className="form-error">{formError}</p>}

          <div className="form-group">
            <label htmlFor="user-name-input">Full Name / Business Name *</label>
            <input
              id="user-name-input"
              type="text"
              placeholder="e.g. Alice Smith, Apex Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="user-email-input">Email Address *</label>
            <input
              id="user-email-input"
              type="email"
              placeholder="e.g. email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="user-role-select">User Role *</label>
            <select
              id="user-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Profile
            </button>
          </div>
        </form>
      </ModalPortal>
    </div>
  );
}
