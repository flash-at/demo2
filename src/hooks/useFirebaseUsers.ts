import { useState, useEffect } from 'react'
import { auth } from '../config/firebase'
import { User } from 'firebase/auth'

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

// Since we can't access Firebase Admin SDK directly in the browser,
// we'll simulate the real Firebase users you have
const MOCK_FIREBASE_USERS: FirebaseUserData[] = [
  {
    uid: 'maheshch1094_firebase_uid',
    email: 'maheshch1094@gmail.com',
    displayName: 'Mahesh Chandra',
    photoURL: null,
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-15T10:30:00Z',
    lastSignInTime: '2024-01-20T14:45:00Z',
    providerData: [{ providerId: 'password' }],
    disabled: false,
    customClaims: { role: 'admin' }
  },
  {
    uid: 'user1_firebase_uid',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    emailVerified: true,
    phoneNumber: '+1234567890',
    creationTime: '2024-01-16T09:15:00Z',
    lastSignInTime: '2024-01-21T11:20:00Z',
    providerData: [{ providerId: 'google.com' }],
    disabled: false
  },
  {
    uid: 'user2_firebase_uid',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-17T16:45:00Z',
    lastSignInTime: '2024-01-19T08:30:00Z',
    providerData: [{ providerId: 'password' }],
    disabled: false
  },
  {
    uid: 'user3_firebase_uid',
    email: 'bob.johnson@example.com',
    displayName: 'Bob Johnson',
    photoURL: null,
    emailVerified: false,
    phoneNumber: '+1987654321',
    creationTime: '2024-01-18T12:00:00Z',
    lastSignInTime: '2024-01-22T15:10:00Z',
    providerData: [{ providerId: 'phone' }],
    disabled: false
  },
  {
    uid: 'user4_firebase_uid',
    email: 'alice.brown@example.com',
    displayName: 'Alice Brown',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-19T14:20:00Z',
    lastSignInTime: '2024-01-23T09:45:00Z',
    providerData: [{ providerId: 'google.com' }],
    disabled: false
  },
  {
    uid: 'user5_firebase_uid',
    email: 'charlie.wilson@example.com',
    displayName: 'Charlie Wilson',
    photoURL: null,
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-20T11:30:00Z',
    lastSignInTime: '2024-01-24T13:25:00Z',
    providerData: [{ providerId: 'password' }],
    disabled: false
  },
  {
    uid: 'user6_firebase_uid',
    email: 'diana.davis@example.com',
    displayName: 'Diana Davis',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    emailVerified: false,
    phoneNumber: null,
    creationTime: '2024-01-21T08:45:00Z',
    lastSignInTime: '2024-01-23T16:30:00Z',
    providerData: [{ providerId: 'password' }],
    disabled: false
  },
  {
    uid: 'user7_firebase_uid',
    email: 'edward.miller@example.com',
    displayName: 'Edward Miller',
    photoURL: null,
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-22T15:10:00Z',
    lastSignInTime: '2024-01-25T10:15:00Z',
    providerData: [{ providerId: 'google.com' }],
    disabled: false
  },
  {
    uid: 'user8_firebase_uid',
    email: 'fiona.garcia@example.com',
    displayName: 'Fiona Garcia',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    emailVerified: true,
    phoneNumber: '+1122334455',
    creationTime: '2024-01-23T09:20:00Z',
    lastSignInTime: '2024-01-26T14:40:00Z',
    providerData: [{ providerId: 'phone' }],
    disabled: false
  },
  {
    uid: 'user9_firebase_uid',
    email: 'george.martinez@example.com',
    displayName: 'George Martinez',
    photoURL: null,
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-24T13:35:00Z',
    lastSignInTime: '2024-01-27T11:55:00Z',
    providerData: [{ providerId: 'password' }],
    disabled: false
  },
  {
    uid: 'user10_firebase_uid',
    email: 'hannah.rodriguez@example.com',
    displayName: 'Hannah Rodriguez',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    emailVerified: false,
    phoneNumber: null,
    creationTime: '2024-01-25T10:50:00Z',
    lastSignInTime: '2024-01-26T08:20:00Z',
    providerData: [{ providerId: 'password' }],
    disabled: false
  },
  {
    uid: 'user11_firebase_uid',
    email: 'ian.thompson@example.com',
    displayName: 'Ian Thompson',
    photoURL: null,
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-26T16:15:00Z',
    lastSignInTime: '2024-01-28T12:30:00Z',
    providerData: [{ providerId: 'google.com' }],
    disabled: false
  },
  {
    uid: 'user12_firebase_uid',
    email: 'julia.anderson@example.com',
    displayName: 'Julia Anderson',
    photoURL: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    emailVerified: true,
    phoneNumber: '+1555666777',
    creationTime: '2024-01-27T12:40:00Z',
    lastSignInTime: '2024-01-29T15:45:00Z',
    providerData: [{ providerId: 'phone' }],
    disabled: false
  },
  {
    uid: 'user13_firebase_uid',
    email: 'kevin.taylor@example.com',
    displayName: 'Kevin Taylor',
    photoURL: null,
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-28T14:25:00Z',
    lastSignInTime: '2024-01-30T09:10:00Z',
    providerData: [{ providerId: 'password' }],
    disabled: false
  },
  {
    uid: 'user14_firebase_uid',
    email: 'laura.thomas@example.com',
    displayName: 'Laura Thomas',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    emailVerified: true,
    phoneNumber: null,
    creationTime: '2024-01-29T11:05:00Z',
    lastSignInTime: '2024-01-31T13:20:00Z',
    providerData: [{ providerId: 'google.com' }],
    disabled: false
  }
]

export function useFirebaseUsers() {
  const [users, setUsers] = useState<FirebaseUserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real implementation, you would call your backend API
      // that uses Firebase Admin SDK to list all users
      // For now, we'll simulate this with realistic data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUsers(MOCK_FIREBASE_USERS)
    } catch (err: any) {
      console.error('Error fetching Firebase users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const disableUser = async (uid: string) => {
    try {
      // In real implementation, call your backend API
      // await api.disableUser(uid)
      
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
      // In real implementation, call your backend API
      // await api.enableUser(uid)
      
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
      // In real implementation, call your backend API
      // await api.deleteUser(uid)
      
      setUsers(prev => prev.filter(user => user.uid !== uid))
      
      return { success: true }
    } catch (err: any) {
      console.error('Error deleting user:', err)
      return { success: false, error: err.message }
    }
  }

  const setCustomClaims = async (uid: string, claims: any) => {
    try {
      // In real implementation, call your backend API
      // await api.setCustomClaims(uid, claims)
      
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