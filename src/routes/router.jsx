import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Users = lazy(() => import("../pages/Users"));
const Signup = lazy(() => import("../pages/Signup"));
const Products = lazy(() => import("../pages/Products"));
const Coupons = lazy(() => import("../pages/Coupons"));
const ElasticSearch = lazy(() => import("../pages/ElasticSearch"));

function withSuspense(element) {
  return (
    <Suspense fallback={<div className="initial-loader">Loading...</div>}>
      {element}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: withSuspense(<Home />),
          },
          {
            path: "users",
            element: withSuspense(<Users />),
          },
          {
            path: "products",
            element: withSuspense(<Products />),
          },
          {
            path: "coupons",
            element: withSuspense(<Coupons />),
          },
          {
            path: "elastic-search",
            element: withSuspense(<ElasticSearch />),
          },
          {
            path: "*",
            element: withSuspense(<NotFound />),
          },
        ],
      },
      {
        path: "/login",
        element: withSuspense(<Login />),
      },
      {
        path: "/signup",
        element: withSuspense(<Signup />),
      },
    ],
  },
]);
