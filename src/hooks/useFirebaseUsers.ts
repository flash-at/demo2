import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface FirebaseUserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  phoneNumber: string | null
  creationTime: string
  lastSignInTime: string
  providerData: any[]
  disabled: boolean
  customClaims?: any
}

// This hook simulates Firebase users with Supabase data
export function useFirebaseUsers() {
  const [users, setUsers] = useState<FirebaseUserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get profiles from Supabase
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
      
      if (profilesError) throw profilesError

      // Get extended user data
      const { data: extendedUsers, error: extendedError } = await supabase
        .from('users_extended')
        .select('*')
      
      if (extendedError) throw extendedError

      // Get admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
      
      if (adminError) throw adminError

      // Map Supabase users to Firebase-like format
      const mappedUsers: FirebaseUserData[] = profiles.map(profile => {
        const extended = extendedUsers.find(u => u.user_id === profile.user_id)
        const isAdmin = adminUsers.some(a => a.user_id === profile.user_id)
        
        return {
          uid: profile.user_id,
          email: profile.user_id.includes('@') ? profile.user_id : `${profile.username}@example.com`,
          displayName: profile.full_name || profile.username,
          photoURL: profile.avatar_url,
          emailVerified: true, // Assume verified in Supabase
          phoneNumber: null,
          creationTime: profile.created_at,
          lastSignInTime: profile.updated_at,
          providerData: [{ providerId: 'supabase' }],
          disabled: false,
          customClaims: isAdmin ? { role: 'admin' } : {}
        }
      })

      // If no users found, create some demo users
      if (mappedUsers.length === 0) {
        const demoUsers: FirebaseUserData[] = Array.from({ length: 15 }, (_, i) => ({
          uid: `user-${i + 1}`,
          email: `user${i + 1}@example.com`,
          displayName: `User ${i + 1}`,
          photoURL: i % 3 === 0 ? `https://i.pravatar.cc/150?img=${i + 10}` : null,
          emailVerified: Math.random() > 0.2,
          phoneNumber: i % 4 === 0 ? `+1${9000000000 + i}` : null,
          creationTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastSignInTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          providerData: [{ 
            providerId: ['password', 'google.com', 'phone'][i % 3]
          }],
          disabled: Math.random() > 0.9,
          customClaims: i === 0 ? { role: 'admin' } : {}
        }))
        
        setUsers(demoUsers)
      } else {
        setUsers(mappedUsers)
      }
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message)
      
      // Fallback to demo data
      const demoUsers: FirebaseUserData[] = Array.from({ length: 15 }, (_, i) => ({
        uid: `user-${i + 1}`,
        email: `user${i + 1}@example.com`,
        displayName: `User ${i + 1}`,
        photoURL: i % 3 === 0 ? `https://i.pravatar.cc/150?img=${i + 10}` : null,
        emailVerified: Math.random() > 0.2,
        phoneNumber: i % 4 === 0 ? `+1${9000000000 + i}` : null,
        creationTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastSignInTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        providerData: [{ 
          providerId: ['password', 'google.com', 'phone'][i % 3]
        }],
        disabled: Math.random() > 0.9,
        customClaims: i === 0 ? { role: 'admin' } : {}
      }))
      
      setUsers(demoUsers)
    } finally {
      setLoading(false)
    }
  }

  const disableUser = async (uid: string) => {
    try {
      // In a real implementation, this would update the user's status in Supabase
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, disabled: true } : user
      ))
      return { success: true }
    } catch (err: any) {
      console.error('Error disabling user:', err)
      return { success: false, error: err.message }
    }
  }

  const enableUser = async (uid: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, disabled: false } : user
      ))
      return { success: true }
    } catch (err: any) {
      console.error('Error enabling user:', err)
      return { success: false, error: err.message }
    }
  }

  const deleteUser = async (uid: string) => {
    try {
      setUsers(prev => prev.filter(user => user.uid !== uid))
      return { success: true }
    } catch (err: any) {
      console.error('Error deleting user:', err)
      return { success: false, error: err.message }
    }
  }

  const setCustomClaims = async (uid: string, claims: any) => {
    try {
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, customClaims: claims } : user
      ))
      return { success: true }
    } catch (err: any) {
      console.error('Error setting custom claims:', err)
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    disableUser,
    enableUser,
    deleteUser,
    setCustomClaims
  }
}

export function useFirebaseUserStats(users: FirebaseUserData[]) {
  const stats = {
    totalUsers: users.length,
    verifiedUsers: users.filter(u => u.emailVerified).length,
    unverifiedUsers: users.filter(u => !u.emailVerified).length,
    disabledUsers: users.filter(u => u.disabled).length,
    activeUsers: users.filter(u => !u.disabled).length,
    googleUsers: users.filter(u => u.providerData.some(p => p.providerId === 'google.com')).length,
    emailUsers: users.filter(u => u.providerData.some(p => p.providerId === 'password')).length,
    phoneUsers: users.filter(u => u.providerData.some(p => p.providerId === 'phone')).length,
    adminUsers: users.filter(u => u.customClaims?.role === 'admin').length,
    recentUsers: users.filter(u => {
      const createdDate = new Date(u.creationTime)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdDate > weekAgo
    }).length
  }

  return stats
}