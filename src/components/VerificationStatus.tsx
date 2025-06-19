import React from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const VerificationStatus: React.FC = () => {
  const { currentUser, resendEmailVerification } = useAuth()
  const { showToast } = useToast()

  if (!currentUser) return null

  const handleResendVerification = async () => {
    try {
      await resendEmailVerification()
      showToast("Verification email sent! Please check your inbox.", "success")
    } catch (error) {
      showToast("Failed to send verification email. Please try again.", "error")
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
        <div className="verification-status unverified">
          <AlertTriangle className="w-4 h-4" />
          <span>Email not verified</span>
          <button
            onClick={handleResendVerification}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Resend
          </button>
        </div>
      )}
    </div>
  )
}

export default VerificationStatus