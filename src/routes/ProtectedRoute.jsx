import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import MainLayout from '../layouts/MainLayout'

export default function ProtectedRoute() {
  const { token } = useAuthStore()

  if (!token) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
