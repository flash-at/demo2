import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth()

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