import { Menu, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function Header({ onMenuClick }) {
  const navigate = useNavigate()
  const { admin, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{admin?.first_name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{admin?.user_email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
