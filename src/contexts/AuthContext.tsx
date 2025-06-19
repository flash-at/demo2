import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  reload,
  ActionCodeSettings
} from 'firebase/auth'
import { auth } from '../config/firebase'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signup: (email: string, password: string, displayName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  resendEmailVerification: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Enhanced rate limiting with better tracking
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number; blocked: boolean }> = new Map()
  private readonly maxAttempts = 3
  private readonly windowMs = 60000 // 1 minute
  private readonly blockDuration = 300000 // 5 minutes block

  canAttempt(key: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(key)

    if (!record) {
      this.attempts.set(key, { count: 1, lastAttempt: now, blocked: false })
      return true
    }

    // Check if still blocked
    if (record.blocked && (now - record.lastAttempt) < this.blockDuration) {
      return false
    }

    // Reset if block period has passed
    if (record.blocked && (now - record.lastAttempt) >= this.blockDuration) {
      this.attempts.set(key, { count: 1, lastAttempt: now, blocked: false })
      return true
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now, blocked: false })
      return true
    }

    // Check if under limit
    if (record.count < this.maxAttempts) {
      record.count++
      record.lastAttempt = now
      return true
    }

    // Block after max attempts
    record.blocked = true
    record.lastAttempt = now
    return false
  }

  getRemainingTime(key: string): number {
    const record = this.attempts.get(key)
    if (!record) return 0
    
    if (record.blocked) {
      const elapsed = Date.now() - record.lastAttempt
      return Math.max(0, this.blockDuration - elapsed)
    }
    
    const elapsed = Date.now() - record.lastAttempt
    return Math.max(0, this.windowMs - elapsed)
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }

  isBlocked(key: string): boolean {
    const record = this.attempts.get(key)
    if (!record) return false
    
    const now = Date.now()
    return record.blocked && (now - record.lastAttempt) < this.blockDuration
  }
}

const rateLimiter = new RateLimiter()

// Enhanced error handling with more specific messages
const handleAuthError = (error: any): Error => {
  console.error('Auth error:', error)
  
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes before trying again.',
    'auth/network-request-failed': 'Network connection issue. Please check your internet connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups and try again.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/credential-already-in-use': 'This credential is already associated with a different account.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/requires-recent-login': 'Please sign out and sign in again to perform this action.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Invalid verification ID. Please request a new code.',
    'auth/code-expired': 'Verification code has expired. Please request a new one.',
    'auth/missing-verification-code': 'Please enter the verification code.',
    'auth/missing-verification-id': 'Verification ID is missing. Please try again.',
    'auth/quota-exceeded': 'Email quota exceeded. Please try again later.',
    'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
    'auth/invalid-phone-number': 'Invalid phone number format.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/app-deleted': 'Firebase app has been deleted.',
    'auth/app-not-authorized': 'App not authorized to use Firebase Authentication.',
    'auth/argument-error': 'Invalid argument provided.',
    'auth/invalid-api-key': 'Invalid API key.',
    'auth/invalid-user-token': 'User token is invalid.',
    'auth/timeout': 'Request timed out. Please try again.',
    'auth/unauthorized-domain': 'Domain is not authorized for this operation.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    'auth/admin-restricted-operation': 'This operation is restricted to administrators only.',
    'auth/invalid-continue-uri': 'Invalid continue URL provided.',
    'auth/missing-continue-uri': 'Continue URL is required.',
    'auth/unauthorized-continue-uri': 'Continue URL is not authorized.'
  }

  const message = errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.'
  return new Error(message)
}

// Retry mechanism with better error handling
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Don't retry certain errors
      const nonRetryableErrors = [
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/email-already-in-use',
        'auth/weak-password',
        'auth/invalid-email',
        'auth/user-disabled',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/invalid-credential',
        'auth/operation-not-allowed',
        'auth/invalid-verification-code',
        'auth/code-expired'
      ]
      
      if (nonRetryableErrors.includes(error.code)) {
        throw error
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signup = async (email: string, password: string, displayName: string) => {
    const rateLimitKey = `signup_${email}`
    
    if (rateLimiter.isBlocked(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 60000)
      throw new Error(`Account creation is temporarily blocked. Please wait ${remainingTime} minutes before trying again.`)
    }

    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many signup attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      const result = await retryWithBackoff(async () => {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        })

        // Prepare email verification settings
        const actionCodeSettings: ActionCodeSettings = {
          url: `${window.location.origin}/auth?verified=true`,
          handleCodeInApp: false
        }

        // Send email verification with proper error handling
        try {
          await sendEmailVerification(userCredential.user, actionCodeSettings)
        } catch (verificationError: any) {
          console.warn('Email verification failed:', verificationError)
          // Don't throw here - account is created, just verification failed
        }

        return userCredential
      })

      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
      return result
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const login = async (email: string, password: string) => {
    const rateLimitKey = `login_${email}`
    
    if (rateLimiter.isBlocked(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 60000)
      throw new Error(`Login is temporarily blocked. Please wait ${remainingTime} minutes before trying again.`)
    }

    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many login attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      const result = await retryWithBackoff(async () => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // Refresh user data to get latest verification status
        await reload(userCredential.user)
        
        return userCredential
      })

      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
      return result
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const logout = async () => {
    try {
      await retryWithBackoff(() => signOut(auth))
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const resetPassword = async (email: string) => {
    const rateLimitKey = `reset_${email}`
    
    if (rateLimiter.isBlocked(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 60000)
      throw new Error(`Password reset is temporarily blocked. Please wait ${remainingTime} minutes before trying again.`)
    }

    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many reset attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth?reset=true`,
        handleCodeInApp: false
      }

      await retryWithBackoff(() => 
        sendPasswordResetEmail(auth, email, actionCodeSettings)
      )

      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const loginWithGoogle = async () => {
    const rateLimitKey = 'google_login'
    
    if (rateLimiter.isBlocked(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 60000)
      throw new Error(`Google sign-in is temporarily blocked. Please wait ${remainingTime} minutes before trying again.`)
    }

    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many Google sign-in attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      // Configure provider settings
      provider.setCustomParameters({
        prompt: 'select_account',
        hd: undefined // Allow any domain
      })
      
      const result = await retryWithBackoff(() => signInWithPopup(auth, provider))

      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
      return result
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const resendEmailVerification = async () => {
    if (!currentUser) {
      throw new Error('No user is currently signed in.')
    }

    const rateLimitKey = `verify_${currentUser.email}`
    
    if (rateLimiter.isBlocked(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 60000)
      throw new Error(`Email verification is temporarily blocked. Please wait ${remainingTime} minutes before trying again.`)
    }

    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many verification attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      // Refresh user data first
      await reload(currentUser)
      
      // Check if already verified
      if (currentUser.emailVerified) {
        throw new Error('Email is already verified.')
      }

      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth?verified=true`,
        handleCodeInApp: false
      }

      await retryWithBackoff(() => sendEmailVerification(currentUser, actionCodeSettings))
      
      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const refreshUser = async () => {
    if (!currentUser) return
    
    try {
      await reload(currentUser)
      // Force a state update by setting the user again
      setCurrentUser({ ...currentUser })
    } catch (error: any) {
      console.error('Error refreshing user:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    }, (error) => {
      console.error('Auth state change error:', error)
      setCurrentUser(null)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Auto-refresh user data periodically to check verification status
  useEffect(() => {
    if (!currentUser || currentUser.emailVerified) return

    const interval = setInterval(async () => {
      try {
        await reload(currentUser)
        if (currentUser.emailVerified) {
          setCurrentUser({ ...currentUser })
        }
      } catch (error) {
        // Ignore errors during periodic refresh
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [currentUser])

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
    resendEmailVerification,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}