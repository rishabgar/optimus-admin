import { Moon, Sun, ShieldCheck, Mail, Phone, Settings as SettingsIcon, Webhook } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useUIStore from '../../store/uiStore'
import toast from 'react-hot-toast'

export default function Settings() {
  const { admin } = useAuthStore()
  const { darkMode, setDarkMode } = useUIStore()

  const handleToggleDarkMode = () => {
    const nextMode = !darkMode
    setDarkMode(nextMode)
    
    // Inject dark class to html and body for tailwind classes and custom css
    if (nextMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      toast.success('Dark mode activated')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      toast.success('Light mode activated')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure interface themes, review active admin credentials, and monitor webhook endpoint connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Admin Profile</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Security Clearance Level 1</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-gray-400 w-16">Name:</span>
              <span className="text-gray-800 dark:text-gray-200">{admin?.first_name || 'Admin User'}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-800 dark:text-gray-200 truncate">{admin?.user_email || 'admin@optimuskart.com'}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-800 dark:text-gray-200">{admin?.user_phone_no || 'Not Set'}</span>
            </div>
          </div>
        </div>

        {/* Display Settings Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Sun className="w-6 h-6 dark:hidden" />
              <Moon className="w-6 h-6 hidden dark:block" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Display Preferences</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Switch theme modes dynamically</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
              <button
                onClick={handleToggleDarkMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  darkMode ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Developer Integration Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Webhook className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Webhook Integrations</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage API callbacks and gateways</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs">
              <p className="font-semibold text-gray-500">PRESCRIPTION_WEBHOOK_URL</p>
              <code className="block bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-150 dark:border-gray-700 mt-1 text-gray-700 dark:text-gray-300 truncate">
                http://localhost:4000/webhook-test
              </code>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-gray-500">IMAGE_SERVICE_CALLBACK</p>
              <code className="block bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-150 dark:border-gray-700 mt-1 text-gray-700 dark:text-gray-300 truncate">
                /product/internal/image-processed
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
