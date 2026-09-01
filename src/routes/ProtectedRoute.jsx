import { useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router";
import styles from "./ProtectedRoute.module.css";

const sidebarItems = [
  {
    label: "Dashboard",
    path: "/",
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    label: "Client",
    path: "/client",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Products",
    path: "/products",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </svg>
    ),
  },
  {
    label: "Coupons",
    path: "/coupons",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 9V5a2 2 0 0 1 2-2h4" />
        <path d="M15 3h4a2 2 0 0 1 2 2v4" />
        <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
        <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
        <path d="m9 15 6-6" />
        <circle cx="9" cy="9" r="1" />
        <circle cx="15" cy="15" r="1" />
      </svg>
    ),
  },
  {
    label: "Reward",
    path: "/reward",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2v20" />
        <path d="M5 7h14v5H5z" />
        <path d="M7 12v8h10v-8" />
        <path d="M12 7C10.5 4.5 8.5 4 7.4 5.1 6.2 6.3 7.2 8 12 7Z" />
        <path d="M12 7c1.5-2.5 3.5-3 4.6-1.9C17.8 6.3 16.8 8 12 7Z" />
      </svg>
    ),
  },
  {
    label: "Elastic Search",
    path: "/elastic-search",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
        <path d="M8 11h6" />
      </svg>
    ),
  },
  {
    label: "Users",
    path: "/users",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    ),
  },
];

function ProtectedRoute() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const [openDropdowns, setOpenDropdowns] = useState({});
  const token = sessionStorage.getItem("optimuskart_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className={`${styles.layout} ${
        isSidebarCollapsed ? styles.collapsed : ""
      }`}
    >
      <aside className={styles.sidebar} aria-label="Main navigation">
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              Q
            </span>
            <span className={styles.brandText}>Quotation</span>
          </div>

          <button
            type="button"
            className={styles.collapseButton}
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-expanded={!isSidebarCollapsed}
            onClick={() => setIsSidebarCollapsed((isCollapsed) => !isCollapsed)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {sidebarItems.map((item) =>
            item.children ? (
              <div className={styles.navGroup} key={item.label}>
                <button
                  type="button"
                  className={styles.navLink}
                  aria-expanded={Boolean(openDropdowns[item.label])}
                  onClick={() =>
                    setOpenDropdowns((currentDropdowns) => ({
                      ...currentDropdowns,
                      [item.label]: !currentDropdowns[item.label],
                    }))
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <svg
                    className={styles.chevronIcon}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {openDropdowns[item.label] ? (
                  <div className={styles.subNav}>
                    {item.children.map((child) => (
                      <NavLink
                        to={child.path}
                        key={child.label}
                        className={({ isActive }) =>
                          `${styles.subNavLink} ${
                            isActive ? styles.activeSubNavLink : ""
                          }`
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <NavLink
                to={item.path}
                end={item.end}
                key={item.label}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ),
          )}
        </nav>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedRoute;
