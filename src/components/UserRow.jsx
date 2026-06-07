export default function UserRow({
  user,
  onEdit,
  onDelete,
  onExpand,
  isSellerTab,
}) {
  return (
    <tr>
      <td style={{ fontWeight: "700" }}>#{user._id}</td>
      <td
        style={{ fontWeight: "700", color: "#1a202c" }}
      >{`${user.first_name} ${user.last_name ?? ""}`}</td>
      <td>{user.user_email}</td>
      <td>{user.user_phone_no}</td>
      <td>
        <span className={`card-badge ${isSellerTab ? "seller" : "admin"}`}>
          {user.user_type}
        </span>
      </td>
      {/* <td style={{ color: "#718096", fontSize: "0.85rem" }}>
        {user.joinedDate}
      </td> */}
      <td className="actions-cell">
        <button
          className="btn-action edit"
          onClick={() => onEdit(user)}
          title="Edit User Info"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>

        <button
          className="btn-action delete"
          onClick={() => onDelete(user.id)}
          title="Delete User"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Delete
        </button>

        {isSellerTab && (
          <button
            className="btn-action expand"
            onClick={() => onExpand(user._id)}
            title="Expand Seller Inventory"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            Expand
          </button>
        )}
      </td>
    </tr>
  );
}
