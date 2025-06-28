import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth()

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-orange-500" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // No user logged in
  if (!currentUser) {
    return <Navigate to="/auth" replace />
  }

  // Check if user has email/password account and is not verified
  const isEmailPasswordAccount = currentUser.providerData.some(
    provider => provider.providerId === 'password'
  )

  if (isEmailPasswordAccount && !currentUser.emailVerified) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute