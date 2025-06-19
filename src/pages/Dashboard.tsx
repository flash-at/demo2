import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mail, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const Dashboard: React.FC = () => {
  const { currentUser, logout, resendEmailVerification } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      showToast('Logged out successfully', 'success')
      navigate('/auth')
    } catch (error) {
      showToast('Failed to log out', 'error')
    }
  }

  const handleResendVerification = async () => {
    try {
      await resendEmailVerification()
      showToast('Verification email sent! Please check your inbox.', 'success')
    } catch (error) {
      showToast('Failed to send verification email', 'error')
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
                      {currentUser.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 
                       currentUser.providerData[0]?.providerId === 'phone' ? 'Phone Account' : 'Email Account'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Verification Status */}
          {currentUser.providerData[0]?.providerId !== 'google.com' && currentUser.providerData[0]?.providerId !== 'phone' && (
            <div className="mb-8">
              {currentUser.emailVerified ? (
                <div className="verification-status verified">
                  <CheckCircle className="w-4 h-4" />
                  <span>Email verified</span>
                </div>
              ) : (
                <div className="verification-status unverified">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Email not verified</span>
                  <button
                    onClick={handleResendVerification}
                    className="ml-2 text-xs underline hover:no-underline"
                  >
                    Resend verification
                  </button>
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