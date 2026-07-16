import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './ProtectedRoute'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'))
const OtpVerification = lazy(() => import('../pages/auth/OtpVerification'))

// Dashboard
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'))

// Shop Types
const ShopTypes = lazy(() => import('../pages/shopTypes/ShopTypes'))

// Categories
const Categories = lazy(() => import('../pages/categories/Categories'))

// Products
const Products = lazy(() => import('../pages/products/Products'))

// Sellers
const Sellers = lazy(() => import('../pages/sellers/Sellers'))
const SellerDetails = lazy(() => import('../pages/sellers/SellerDetails'))

// Customers
const Customers = lazy(() => import('../pages/customers/Customers'))

// Orders
const Orders = lazy(() => import('../pages/orders/Orders'))

// Settings
const Settings = lazy(() => import('../pages/settings/Settings'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/verify-otp" element={<OtpVerification />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shop-types" element={<ShopTypes />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/sellers/:id" element={<SellerDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
