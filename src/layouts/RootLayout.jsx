import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">Secure access</p>
          <h1>Optimuskart</h1>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
