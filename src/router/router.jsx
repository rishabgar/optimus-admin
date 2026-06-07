import { createBrowserRouter } from "react-router-dom";
import NotFoundPage from "../pages/NotFoundPage";
import RootLayout from "../layouts/RootLayout";
import RouteErrorBoundary from "./RouteErrorBoundary";
import SendOtpPage from "../pages/SendOtpPage";
import VerifyOtpPage from "../pages/VerifyOtpPage";
import { protectedLoader } from "./protectedLoader";
import ProtectedLayout from "../layouts/ProctectedLayout";
import DashboardPage from "../pages/DashboardPage";
import InventoryServicePage from "../pages/InventoryServicePage";
import UserManagementPage from "../pages/UserManagementPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      // Public routes
      {
        index: true,
        element: <SendOtpPage />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtpPage />,
      },
      // Not found page
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    // Protected routes
    path: "/",
    loader: protectedLoader,
    element: <ProtectedLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "inventory-service",
        element: <InventoryServicePage />,
      },
      {
        path: "user-management",
        element: <UserManagementPage />,
      },
    ],
  },
]);
