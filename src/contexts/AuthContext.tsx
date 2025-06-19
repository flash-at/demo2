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

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName.trim()
    })

    // Send email verification
    await sendEmailVerification(userCredential.user, {
      url: window.location.origin + '/auth',
      handleCodeInApp: false
    })
  }

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // Check email verification
    if (!userCredential.user.emailVerified) {
      // Send verification email again
      await sendEmailVerification(userCredential.user)
      await signOut(auth)
      throw new Error("Please verify your email before signing in. A new verification email has been sent.")
    }
  }

  const logout = () => {
    return signOut(auth)
  }

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email, {
      url: window.location.origin + '/auth',
      handleCodeInApp: false
    })
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    
    return signInWithPopup(auth, provider)
  }

  const resendEmailVerification = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
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