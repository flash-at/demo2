import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

interface AdminLoginForm {
  email: string
  password: string
}

const AdminLoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login, currentUser, loading } = useAuth()
  const { showToast } = useToast()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<AdminLoginForm>()

  // Pre-fill admin credentials
  useEffect(() => {
    setValue('email', 'maheshch1094@gmail.com')
    setValue('password', '@Mahesh06')
  }, [setValue])

  // Redirect if already authenticated and is admin
  useEffect(() => {
    if (!loading && currentUser) {
      const adminEmails = ['maheshch1094@gmail.com', 'admin@codecafe.com', 'superadmin@codecafe.com']
      if (adminEmails.includes(currentUser.email?.toLowerCase() || '')) {
        navigate('/dashboard')
      } else {
        showToast('Access denied. Admin privileges required.', 'error')
        navigate('/auth')
      }
    }
  }, [currentUser, loading, navigate, showToast])

  const onSubmit = async (data: AdminLoginForm) => {
    setIsLoading(true)
    try {
      // Check if email is in admin list
      const adminEmails = ['maheshch1094@gmail.com', 'admin@codecafe.com', 'superadmin@codecafe.com']
      if (!adminEmails.includes(data.email.toLowerCase())) {
        throw new Error('Access denied. This email is not authorized for admin access.')
      }

      await login(data.email, data.password)
      showToast('Admin login successful! Welcome to the admin panel.', 'success')
      navigate('/dashboard')
    } catch (error: any) {
      showToast(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-slate-400 mt-2">Secure access to CodeCafe administration</p>
        </header>

        {/* Admin Login Form */}
        <main className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-semibold text-slate-100">Administrator Login</h2>
            </div>
            <p className="text-sm text-slate-400">
              Enter your admin credentials to access the management panel
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="input-field block w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="input-field block w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Authenticating...
                </div>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Pre-filled Credentials Info */}
          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <h3 className="text-sm font-medium text-orange-400 mb-2">Demo Admin Credentials</h3>
            <div className="text-xs text-slate-300 space-y-1">
              <p><strong>Email:</strong> maheshch1094@gmail.com</p>
              <p><strong>Password:</strong> @Mahesh06</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Credentials are pre-filled for easy access
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              ← Back to User Login
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} CodeCafe Admin Portal</p>
          <p className="mt-1">Secure administrative access</p>
        </footer>
      </div>
    </div>
  )
}

export default AdminLoginPage