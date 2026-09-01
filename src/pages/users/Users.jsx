import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsersByType } from "../../services/api/users";
import Portal from "../../utils/portal";
import styles from "./Users.module.css";

const USER_TABS = [
  { label: "Seller", value: "seller" },
  { label: "Customer", value: "customer" },
  { label: "Delivery Partner", value: "delivery_partner" },
];

const SIX_HOURS = 6 * 60 * 60 * 1000;

const getSavedAddresses = (addresses = []) => {
  if (!addresses.length) return "-";

  return addresses.map((item) => item.address).filter(Boolean).join(", ") || "-";
};

const getOperatingHours = (operatingHours) => {
  if (!operatingHours?.open && !operatingHours?.close) return "-";

  return `${operatingHours?.open || "-"} - ${operatingHours?.close || "-"}`;
};

function Users() {
  const [activeUserType, setActiveUserType] = useState(USER_TABS[0].value);
  const [openActionUserId, setOpenActionUserId] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", activeUserType],
    queryFn: () => getUsersByType(activeUserType),
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  return (
    <section className={styles.users}>
      <div className={styles.header}>
        <h1>Users</h1>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="User type">
        {USER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeUserType === tab.value}
            className={
              activeUserType === tab.value ? styles.activeTab : styles.tab
            }
            onClick={() => setActiveUserType(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Saved Addresses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className={styles.statusCell}>
                  Loading users...
                </td>
              </tr>
            ) : null}

            {isError ? (
              <tr>
                <td colSpan="5" className={styles.statusCell}>
                  {error?.message || "Unable to load users."}
                </td>
              </tr>
            ) : null}

            {!isLoading && !isError && users.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.statusCell}>
                  No users found.
                </td>
              </tr>
            ) : null}

            {!isLoading && !isError
              ? users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.first_name || "-"}</td>
                    <td>{user.user_email || "-"}</td>
                    <td>{user.user_phone_no || "-"}</td>
                    <td>{getSavedAddresses(user.saved_addresses)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.actionButton}
                          aria-label={`Open actions for ${
                            user.first_name || "user"
                          }`}
                          aria-expanded={openActionUserId === user._id}
                          onClick={() =>
                            setOpenActionUserId((currentUserId) =>
                              currentUserId === user._id ? null : user._id,
                            )
                          }
                        >
                          <span aria-hidden="true">...</span>
                        </button>

                        {openActionUserId === user._id ? (
                          <div className={styles.actionMenu}>
                            {user.user_type === "seller" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedShop(user.shop || {});
                                  setOpenActionUserId(null);
                                }}
                              >
                                View shop
                              </button>
                            ) : (
                              <span>No actions</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {selectedShop ? (
        <Portal>
          <div
            className={styles.modalOverlay}
            role="presentation"
            onMouseDown={() => setSelectedShop(null)}
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="shop-details-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 id="shop-details-title">Shop Details</h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close shop details"
                  onClick={() => setSelectedShop(null)}
                >
                  x
                </button>
              </div>

              <table className={styles.detailsTable}>
                <tbody>
                  <tr>
                    <th>Shop Name</th>
                    <td>{selectedShop.shop_name || "-"}</td>
                  </tr>
                  <tr>
                    <th>Shop Address</th>
                    <td>{selectedShop.shop_address || "-"}</td>
                  </tr>
                  <tr>
                    <th>Operating Hours</th>
                    <td>{getOperatingHours(selectedShop.operating_hours)}</td>
                  </tr>
                  <tr>
                    <th>GST Number</th>
                    <td>{selectedShop.gst_number || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Portal>
      ) : null}
    </section>
  );
}

export default Users;
