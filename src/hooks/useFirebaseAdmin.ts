import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface FirebaseUser {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  disabled: boolean
  emailVerified: boolean
  phoneNumber?: string
  creationTime: string
  lastSignInTime?: string
  lastRefreshTime?: string
  providerData: Array<{
    providerId: string
    uid: string
    email?: string
    displayName?: string
    photoURL?: string
  }>
  customClaims?: Record<string, any>
  tokensValidAfterTime?: string
}

export interface FirebaseUsersResponse {
  users: FirebaseUser[]
  pageToken?: string
  totalUsers: number
}

export function useFirebaseAdmin() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<FirebaseUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = async () => {
    if (!currentUser) {
      throw new Error('No authenticated user')
    }

    const token = await currentUser.getIdToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: FirebaseUsersResponse = await response.json()
      setUsers(data.users)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message)
      // Don't show mock data - show the actual error
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const disableUser = async (uid: string) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}/disable`, {
        method: 'POST',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, disabled: true } : user
      ))

      return await response.json()
    } catch (err: any) {
      console.error('Error disabling user:', err)
      throw err
    }
  }

  const enableUser = async (uid: string) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}/enable`, {
        method: 'POST',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, disabled: false } : user
      ))

      return await response.json()
    } catch (err: any) {
      console.error('Error enabling user:', err)
      throw err
    }
  }

  const deleteUser = async (uid: string) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Update local state
      setUsers(prev => prev.filter(user => user.uid !== uid))

      return await response.json()
    } catch (err: any) {
      console.error('Error deleting user:', err)
      throw err
    }
  }

  const updateUser = async (uid: string, updates: Partial<FirebaseUser>) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, ...updates } : user
      ))

      return result
    } catch (err: any) {
      console.error('Error updating user:', err)
      throw err
    }
  }

  const createUser = async (userData: {
    email: string
    password: string
    displayName?: string
    phoneNumber?: string
    emailVerified?: boolean
  }) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      // Refresh users list
      await fetchUsers()

      return result
    } catch (err: any) {
      console.error('Error creating user:', err)
      throw err
    }
  }

  const revokeTokens = async (uid: string) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}/revoke-tokens`, {
        method: 'POST',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (err: any) {
      console.error('Error revoking tokens:', err)
      throw err
    }
  }

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`)
      return response.ok
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  return {
    users,
    loading,
    error,
    fetchUsers,
    disableUser,
    enableUser,
    deleteUser,
    updateUser,
    createUser,
    revokeTokens,
    checkApiHealth
  }
}