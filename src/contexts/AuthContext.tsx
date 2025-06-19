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

// Simple rate limiting
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  private readonly maxAttempts = 5
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
  console.error('Auth error:', error)
  
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait before trying again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/quota-exceeded': 'Email quota exceeded. Please try again later.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    'auth/invalid-continue-uri': 'Invalid continue URL provided.',
    'auth/missing-continue-uri': 'Continue URL is required.',
    'auth/unauthorized-continue-uri': 'Continue URL is not authorized.'
  }

  const message = errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.'
  return new Error(message)
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signup = async (email: string, password: string, displayName: string) => {
    const rateLimitKey = `signup_${email}`
    
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many signup attempts. Please wait ${remainingTime} seconds.`)
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      })

      // Send email verification
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth`,
        handleCodeInApp: false
      }

      await sendEmailVerification(userCredential.user, actionCodeSettings)

      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
      
      return userCredential
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const login = async (email: string, password: string) => {
    const rateLimitKey = `login_${email}`
    
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many login attempts. Please wait ${remainingTime} seconds.`)
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Refresh user data to get latest verification status
      await reload(userCredential.user)
      
      // Check email verification for email/password accounts only
      const isEmailPasswordAccount = userCredential.user.providerData.some(
        provider => provider.providerId === 'password'
      )
      
      if (isEmailPasswordAccount && !userCredential.user.emailVerified) {
        // Sign out the user immediately
        await signOut(auth)
        throw new Error('Please verify your email before signing in. Check your inbox for the verification email.')
      }

      // Reset rate limit on success
      rateLimiter.reset(rateLimitKey)
      return userCredential
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const resetPassword = async (email: string) => {
    const rateLimitKey = `reset_${email}`
    
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000)
      throw new Error(`Too many reset attempts. Please wait ${remainingTime} seconds.`)
    }

    try {
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth`,
        handleCodeInApp: false
      }

      await sendPasswordResetEmail(auth, email, actionCodeSettings)

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
      throw new Error(`Too many Google sign-in attempts. Please wait ${remainingTime} seconds.`)
    }

    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)

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
      throw new Error(`Too many verification attempts. Please wait ${remainingTime} seconds.`)
    }

    try {
      // Refresh user data first
      await reload(currentUser)
      
      // Check if already verified
      if (currentUser.emailVerified) {
        throw new Error('Email is already verified.')
      }

      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth`,
        handleCodeInApp: false
      }

      await sendEmailVerification(currentUser, actionCodeSettings)
      
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
      // Trigger a re-render by updating the state
      setCurrentUser({ ...currentUser })
    } catch (error: any) {
      console.error('Error refreshing user:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out')
        setCurrentUser(user)
        setLoading(false)
      }, 
      (error) => {
        console.error('Auth state change error:', error)
        setCurrentUser(null)
        setLoading(false)
      }
    )

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
    resendEmailVerification,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}