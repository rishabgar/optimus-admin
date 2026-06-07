import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function ProtectedLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`protected-shell ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <aside className="protected-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div>
              <span className="sidebar-eyebrow">Workspace</span>
              <strong>Protected Area</strong>
            </div>

            <button
              aria-label="Close sidebar"
              className="icon-button"
              onClick={toggleSidebar}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
              Dashboard
            </NavLink>
          </nav>
          <nav className="sidebar-nav">
            <NavLink to="/inventory-service" className={({ isActive }) => isActive ? "active" : ""}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                <path d="M12 2L2 7l10 5 10-5L12 2z"></path>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              Inventory Service
            </NavLink>
          </nav>
          <nav className="sidebar-nav">
            <NavLink to="/user-management" className={({ isActive }) => isActive ? "active" : ""}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline>
              </svg>
              User Management
            </NavLink>
          </nav>

          <button className="logout-button" onClick={handleLogout} type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="protected-main">
        <header className="protected-topbar">
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            type="button"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <path d="M17 16l-4-4 4-4"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <path d="M13 8l4 4-4 4"></path>
              </svg>
            )}
          </button>
          <span className="topbar-title">Dashboard</span>
        </header>

        <section className="protected-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

