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
  reload
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

// Rate limiting helper
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  private readonly maxAttempts = 3
  private readonly windowMs = 60000 // 1 minute

  canAttempt(key: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(key)

    if (!record) {
      this.attempts.set(key, { count: 1, lastAttempt: now })
      return true
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now })
      return true
    }

    // Check if under limit
    if (record.count < this.maxAttempts) {
      record.count++
      record.lastAttempt = now
      return true
    }

    return false
  }

  getRemainingTime(key: string): number {
    const record = this.attempts.get(key)
    if (!record) return 0
    
    const elapsed = Date.now() - record.lastAttempt
    return Math.max(0, this.windowMs - elapsed)
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

const rateLimiter = new RateLimiter()

// Enhanced error handling
const handleAuthError = (error: any): Error => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes before trying again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups and try again.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/credential-already-in-use': 'This credential is already associated with a different account.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/requires-recent-login': 'Please sign out and sign in again to perform this action.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Invalid verification ID. Please request a new code.',
    'auth/code-expired': 'Verification code has expired. Please request a new one.',
    'auth/missing-verification-code': 'Please enter the verification code.',
    'auth/missing-verification-id': 'Verification ID is missing. Please try again.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
    'auth/invalid-phone-number': 'Invalid phone number format.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/app-deleted': 'Firebase app has been deleted.',
    'auth/app-not-authorized': 'App not authorized to use Firebase Authentication.',
    'auth/argument-error': 'Invalid argument provided.',
    'auth/invalid-api-key': 'Invalid API key.',
    'auth/invalid-user-token': 'User token is invalid.',
    'auth/network-request-failed': 'Network request failed. Please check your connection.',
    'auth/timeout': 'Request timed out. Please try again.',
    'auth/unauthorized-domain': 'Domain is not authorized for this operation.'
  }

  const message = errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.'
  return new Error(message)
}

// Retry mechanism with exponential backoff
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
        'auth/invalid-credential'
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
    
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many signup attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      const result = await retryWithBackoff(async () => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        })

        // Send email verification with retry
        await sendEmailVerification(userCredential.user, {
          url: window.location.origin + '/auth',
          handleCodeInApp: false
        })

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
    
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many login attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      const result = await retryWithBackoff(async () => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // Check email verification for email/password accounts
        if (userCredential.user.providerData[0]?.providerId === 'password' && !userCredential.user.emailVerified) {
          // Send verification email again
          await sendEmailVerification(userCredential.user)
          await signOut(auth)
          throw new Error("Please verify your email before signing in. A new verification email has been sent.")
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

  const logout = async () => {
    try {
      await retryWithBackoff(() => signOut(auth))
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const resetPassword = async (email: string) => {
    const rateLimitKey = `reset_${email}`
    
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many reset attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      await retryWithBackoff(() => 
        sendPasswordResetEmail(auth, email, {
          url: window.location.origin + '/auth',
          handleCodeInApp: false
        })
      )

      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const loginWithGoogle = async () => {
    const rateLimitKey = 'google_login'
    
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
        prompt: 'select_account'
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
    
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many verification attempts. Please wait ${remainingTime} seconds before trying again.`)
    }

    try {
      await retryWithBackoff(() => sendEmailVerification(currentUser))
      
      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    }, (error) => {
      console.error('Auth state change error:', error)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
    resendEmailVerification
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}