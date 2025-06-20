import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Code, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator'
import VerificationStatus from '../components/VerificationStatus'

type FormType = 'login' | 'signup' | 'reset'

interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

interface SignupForm {
  email: string
  displayName: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

interface ResetForm {
  email: string
}

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FormType>('login')
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [watchPassword, setWatchPassword] = useState('')

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, signup, resetPassword, loginWithGoogle, currentUser, loading, refreshUser } = useAuth()
  const { showToast } = useToast()

  const loginForm = useForm<LoginForm>()
  const signupForm = useForm<SignupForm>()
  const resetForm = useForm<ResetForm>()

  // Handle URL parameters for verification and reset confirmations
  useEffect(() => {
    const verified = searchParams.get('verified')
    const reset = searchParams.get('reset')
    
    if (verified === 'true') {
      showToast('Email verification link clicked! Please check your verification status.', 'success', 6000)
      if (currentUser) {
        refreshUser()
      }
    }
    
    if (reset === 'true') {
      showToast('Password reset link clicked! You can now reset your password.', 'info', 6000)
      setActiveTab('reset')
    }
  }, [searchParams, showToast, currentUser, refreshUser])

  // Redirect if already authenticated and verified
  useEffect(() => {
    if (!loading && currentUser) {
      const isEmailPasswordAccount = currentUser.providerData.some(
        provider => provider.providerId === 'password'
      )
      
      // If it's not an email/password account OR if it is and it's verified, redirect
      if (!isEmailPasswordAccount || currentUser.emailVerified) {
        navigate('/dashboard')
      }
    }
  }, [currentUser, loading, navigate])

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      showToast('Login successful! Welcome back.', 'success')
      navigate('/dashboard')
    } catch (error: any) {
      showToast(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      showToast('Passwords do not match.', 'error')
      return
    }

    if (data.password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error')
      return
    }

    setIsLoading(true)
    try {
      await signup(data.email, data.password, data.displayName)
      showToast(
        'Account created successfully! Please check your email to verify your account before signing in.',
        'success',
        8000
      )
      signupForm.reset()
      setWatchPassword('')
      setActiveTab('login')
    } catch (error: any) {
      showToast(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (data: ResetForm) => {
    setIsLoading(true)
    try {
      await resetPassword(data.email)
      showToast(
        'Password reset email sent! Please check your inbox for the reset link.',
        'success',
        8000
      )
      resetForm.reset()
      setActiveTab('login')
    } catch (error: any) {
      showToast(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const result = await loginWithGoogle()
      showToast(
        `Welcome ${result.user.displayName || 'User'}! Signed in with Google.`,
        'success'
      )
      navigate('/dashboard')
    } catch (error: any) {
      if (error.message.includes('popup') || error.message.includes('cancelled')) {
        showToast('Google sign-in was cancelled or blocked by your browser.', 'info')
      } else {
        showToast(error.message, 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneAuth = () => {
    navigate('/phone-auth')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            CodeCafe
          </h1>
          <p className="text-slate-400 mt-2">Your coding journey starts here</p>
        </header>

        {/* Main Auth Container */}
        <main className="bg-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/50">
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-slate-700">
            <nav className="-mb-px flex space-x-1">
              {[
                { key: 'login', label: 'Login' },
                { key: 'signup', label: 'Sign Up' },
                { key: 'reset', label: 'Reset' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as FormType)}
                  disabled={isLoading}
                  className={`tab-button flex-1 py-3 px-4 text-center border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeTab === tab.key
                      ? 'active border-purple-500 text-purple-400 bg-purple-500/10'
                      : 'border-transparent text-slate-300 hover:text-purple-400 hover:border-purple-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  {...loginForm.register('email', { required: 'Email is required' })}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="input-field block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-400">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.loginPassword ? 'text' : 'password'}
                    {...loginForm.register('password', { required: 'Password is required' })}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="input-field block w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('loginPassword')}
                    disabled={isLoading}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword.loginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-400">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...loginForm.register('rememberMe')}
                    disabled={isLoading}
                    className="rounded border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="ml-2 text-sm text-slate-300">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('reset')}
                  disabled={isLoading}
                  className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  {...signupForm.register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="input-field block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {signupForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-400">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  {...signupForm.register('displayName', { 
                    required: 'Display name is required',
                    minLength: {
                      value: 2,
                      message: 'Display name must be at least 2 characters'
                    }
                  })}
                  placeholder="Your display name"
                  disabled={isLoading}
                  className="input-field block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {signupForm.formState.errors.displayName && (
                  <p className="mt-1 text-sm text-red-400">{signupForm.formState.errors.displayName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.signupPassword ? 'text' : 'password'}
                    {...signupForm.register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                    placeholder="Create a strong password (min. 8 chars)"
                    disabled={isLoading}
                    onChange={(e) => setWatchPassword(e.target.value)}
                    className="input-field block w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('signupPassword')}
                    disabled={isLoading}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword.signupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-400">{signupForm.formState.errors.password.message}</p>
                )}
                <PasswordStrengthIndicator password={watchPassword} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    className="input-field block w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    disabled={isLoading}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...signupForm.register('agreeTerms', { required: 'You must agree to the terms' })}
                  disabled={isLoading}
                  className="rounded border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label className="ml-2 text-sm text-slate-300">
                  I agree to the{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {signupForm.formState.errors.agreeTerms && (
                <p className="mt-1 text-sm text-red-400">{signupForm.formState.errors.agreeTerms.message}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {activeTab === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-200">Reset Your Password</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  {...resetForm.register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="Enter your registered email"
                  disabled={isLoading}
                  className="input-field block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {resetForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-400">{resetForm.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending Reset Link...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  disabled={isLoading}
                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Social Login Divider */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-slate-400">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="btn-secondary w-full flex items-center justify-center py-3 px-4 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed bg-slate-700/50 hover:bg-slate-600/50"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button
              onClick={handlePhoneAuth}
              disabled={isLoading}
              className="btn-secondary w-full flex items-center justify-center py-3 px-4 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed bg-slate-700/50 hover:bg-slate-600/50"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Continue with Phone
            </button>
          </div>

          {/* Email Verification Status */}
          {currentUser && <VerificationStatus />}
        </main>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} CodeCafe. All rights reserved.</p>
          <p className="mt-1">Powered by Firebase Authentication</p>
        </footer>
      </div>
    </div>
  )
}

export default AuthPage