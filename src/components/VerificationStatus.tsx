import React, { useState } from 'react'
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const VerificationStatus: React.FC = () => {
  const { currentUser, resendEmailVerification, refreshUser } = useAuth()
  const { showToast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  if (!currentUser) return null

  // Don't show for Google or phone auth users
  if (currentUser.providerData[0]?.providerId === 'google.com' || 
      currentUser.providerData[0]?.providerId === 'phone') {
    return null
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await resendEmailVerification()
      showToast("Verification email sent! Please check your inbox and spam folder.", "success", 6000)
    } catch (error: any) {
      showToast(error.message, "error")
    } finally {
      setIsResending(false)
    }
  }

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    try {
      await refreshUser()
      if (currentUser.emailVerified) {
        showToast("Email verification confirmed!", "success")
      } else {
        showToast("Email verification status checked. Still pending verification.", "info")
      }
    } catch (error: any) {
      showToast("Failed to refresh verification status.", "error")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="mt-6">
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
              disabled={isResending}
              className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-md hover:bg-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Email'
              )}
            </button>
            
            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-3 py-1 bg-slate-600/50 text-slate-300 rounded-md hover:bg-slate-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}

export default VerificationStatus