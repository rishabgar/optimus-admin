import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("../pages/home/Home"));
const Login = lazy(() => import("../pages/login/Login"));
const NotFound = lazy(() => import("../pages/notFound/NotFound"));
const Users = lazy(() => import("../pages/users/Users"));
const Signup = lazy(() => import("../pages/signup/Signup"));
const Products = lazy(() => import("../pages/products/Products"));
const Coupons = lazy(() => import("../pages/coupons/Coupons"));
const Reward = lazy(() => import("../pages/rewardProducts/reward"));
const ElasticSearch = lazy(() => import("../pages/elasticSearch/ElasticSearch"));

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
            path: "reward",
            element: withSuspense(<Reward />),
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
