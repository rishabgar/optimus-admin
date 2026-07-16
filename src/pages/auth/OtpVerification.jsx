import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react'
import { authService } from '../../services'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function OtpVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAdmin } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)
  
  const email = location.state?.email || ''

  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please log in again.')
      navigate('/auth/login')
    }
  }, [email, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authService.verifyOtp(email, data.otp)
      const userDetails = response.data.data
      
      // Safety check: is this an admin?
      if (userDetails.user_type !== 'admin') {
        toast.error('Access denied. Admin access only.')
        return
      }

      setAdmin(userDetails, userDetails.token)
      toast.success(`Welcome back, ${userDetails.first_name || 'Admin'}!`)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authService.sendOtp(email)
      toast.success('A new OTP has been sent!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
        <div>
          <button
            onClick={() => navigate('/auth/login')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to login
          </button>
        </div>

        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-accent" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Verify Email
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We sent a 6-digit OTP code to <br />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-center">
              Enter 6-digit verification code
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              className={`w-full text-center tracking-widest text-2xl font-bold py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-transparent dark:text-white dark:border-gray-600 transition-colors ${
                errors.otp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="000000"
              {...register('otp', {
                required: 'Verification code is required',
                minLength: { value: 6, message: 'OTP must be 6 digits' },
                pattern: { value: /^[0-9]+$/, message: 'OTP must be digits only' },
              })}
            />
            {errors.otp && (
              <p className="mt-1.5 text-xs text-red-500 text-center font-medium">{errors.otp.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-blue-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Didn't receive code? </span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm font-semibold text-accent hover:underline disabled:opacity-50 transition-all"
          >
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  )
}
