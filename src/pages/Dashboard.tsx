import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mail, Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const Dashboard: React.FC = () => {
  const { currentUser, logout, resendEmailVerification, refreshUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      showToast('Logged out successfully', 'success')
      navigate('/auth')
    } catch (error: any) {
      showToast('Failed to log out', 'error')
    }
  }

  const handleResendVerification = async () => {
    try {
      await resendEmailVerification()
      showToast('Verification email sent! Please check your inbox and spam folder.', 'success', 6000)
    } catch (error: any) {
      showToast(error.message, 'error')
    }
  }

  const handleRefreshVerification = async () => {
    setIsRefreshing(true)
    try {
      await refreshUser()
      if (currentUser?.emailVerified) {
        showToast('Email verification confirmed!', 'success')
      } else {
        showToast('Verification status updated. Still pending verification.', 'info')
      }
    } catch (error: any) {
      showToast('Failed to refresh verification status', 'error')
    } finally {
      setIsRefreshing(false)
    }
  }

  const redirectToExternalDashboard = () => {
    showToast('Redirecting to main dashboard...', 'info', 2000)
    setTimeout(() => {
      window.location.href = 'https://mahesh06.me/chatbot/'
    }, 1500)
  }

  if (!currentUser) {
    return null
  }

  const isEmailPasswordUser = currentUser.providerData[0]?.providerId === 'password'
  const isGoogleUser = currentUser.providerData[0]?.providerId === 'google.com'
  const isPhoneUser = currentUser.providerData[0]?.providerId === 'phone'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            Welcome to CodeCafe
          </h1>
          <p className="text-slate-400">Your authentication was successful!</p>
        </header>

        {/* Main Dashboard Card */}
        <main className="bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/50">
          {/* User Info Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">
                  {currentUser.displayName || 'User'}
                </h2>
                <p className="text-slate-400">{currentUser.email}</p>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-300">Email</p>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-300">Account Type</p>
                    <p className="text-xs text-slate-400">
                      {isGoogleUser ? 'Google Account' : 
                       isPhoneUser ? 'Phone Account' : 'Email Account'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Verification Status - Only for email/password users */}
          {isEmailPasswordUser && (
            <div className="mb-8">
              {currentUser.emailVerified ? (
                <div className="verification-status verified">
                  <CheckCircle className="w-4 h-4" />
                  <span>Email verified</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="verification-status unverified">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Email not verified</span>
                  </div>
                  
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={handleResendVerification}
                      className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-md hover:bg-orange-500/30 transition-colors"
                    >
                      Resend Email
                    </button>
                    
                    <button
                      onClick={handleRefreshVerification}
                      disabled={isRefreshing}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-600/50 text-slate-300 rounded-md hover:bg-slate-600/70 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Checking...' : 'Check Status'}
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-400">
                    Check your email (including spam folder) and click the verification link. 
                    Then click "Check Status" to refresh.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={redirectToExternalDashboard}
              className="btn-primary w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500"
            >
              Continue to Main Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="btn-secondary w-full flex justify-center items-center py-3 px-4 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>

          {/* Account Info */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="text-center text-sm text-slate-400">
              <p>Account created: {new Date(currentUser.metadata.creationTime!).toLocaleDateString()}</p>
              <p>Last sign in: {new Date(currentUser.metadata.lastSignInTime!).toLocaleDateString()}</p>
              {currentUser.uid && (
                <p className="text-xs mt-2 font-mono text-slate-500">ID: {currentUser.uid.slice(0, 8)}...</p>
              )}
            </div>
          </div>
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

export default Dashboard