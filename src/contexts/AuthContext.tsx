import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  currentUser: User | null
  session: Session | null
  loading: boolean
  signup: (email: string, password: string, displayName: string) => Promise<any>
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<any>
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

// Enhanced error handling
const handleAuthError = (error: any): Error => {
  console.error('Auth error:', error)
  
  const errorMessages: Record<string, string> = {
    'user-not-found': 'No account found with this email address.',
    'invalid-login-credentials': 'Incorrect email or password. Please try again.',
    'email-already-in-use': 'An account with this email already exists.',
    'weak-password': 'Password is too weak. Please choose a stronger password.',
    'invalid-email': 'Please enter a valid email address.',
    'user-disabled': 'This account has been disabled.',
    'too-many-requests': 'Too many failed attempts. Please wait before trying again.',
    'network-request-failed': 'Network error. Please check your connection and try again.',
    'popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'cancelled-popup-request': 'Sign-in was cancelled.',
    'popup-blocked': 'Sign-in popup was blocked by your browser.',
    'invalid-credential': 'Invalid credentials. Please check your email and password.',
    'operation-not-allowed': 'This sign-in method is not enabled.',
    'quota-exceeded': 'Email quota exceeded. Please try again later.',
    'internal-error': 'An internal error occurred. Please try again.',
    'invalid-continue-uri': 'Invalid continue URL provided.',
    'missing-continue-uri': 'Continue URL is required.',
    'unauthorized-continue-uri': 'Continue URL is not authorized.'
  }

  const message = errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.'
  return new Error(message)
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName.trim(),
            username: email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth?verified=true`
        }
      })
      
      if (error) throw error
      
      return data
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      return data
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`
      })
      
      if (error) throw error
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) throw error
      
      return data
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const resendEmailVerification = async () => {
    if (!currentUser) {
      throw new Error('No user is currently signed in.')
    }

    try {
      // Supabase doesn't have a direct "resend verification" method
      // We'll use the same signUp method which will resend the email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: currentUser.email || '',
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      throw handleAuthError(error)
    }
  }

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.refreshSession()
      if (data.user) {
        setCurrentUser(data.user)
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error)
    }
  }

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setCurrentUser(session?.user || null)
        setLoading(false)
      }
    )

    // Get initial session
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setCurrentUser(data.session?.user || null)
      setLoading(false)
    }

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    currentUser,
    session,
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