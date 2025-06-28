import React, { useState } from 'react'
import { Users, Download, RefreshCw, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'
import { auth } from '../../config/firebase'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface FirebaseUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  creationTime: string
  lastSignInTime: string
  providerData: any[]
}

const FirebaseUserImporter: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [importResults, setImportResults] = useState<{
    success: number
    failed: number
    skipped: number
    errors: string[]
  }>({
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  })

  // Mock Firebase users data (since we can't directly access Firebase Admin SDK in frontend)
  // In a real implementation, this would come from your Firebase Admin SDK on the backend
  const mockFirebaseUsers: FirebaseUser[] = [
    {
      uid: 'user1_firebase_uid',
      email: 'user1@example.com',
      displayName: 'John Doe',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-15T10:30:00Z',
      lastSignInTime: '2024-01-20T14:45:00Z',
      providerData: [{ providerId: 'password' }]
    },
    {
      uid: 'user2_firebase_uid',
      email: 'user2@example.com',
      displayName: 'Jane Smith',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-16T09:15:00Z',
      lastSignInTime: '2024-01-21T11:20:00Z',
      providerData: [{ providerId: 'google.com' }]
    },
    {
      uid: 'user3_firebase_uid',
      email: 'user3@example.com',
      displayName: 'Bob Johnson',
      photoURL: null,
      emailVerified: false,
      creationTime: '2024-01-17T16:45:00Z',
      lastSignInTime: '2024-01-19T08:30:00Z',
      providerData: [{ providerId: 'password' }]
    },
    {
      uid: 'user4_firebase_uid',
      email: 'user4@example.com',
      displayName: 'Alice Brown',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-18T12:00:00Z',
      lastSignInTime: '2024-01-22T15:10:00Z',
      providerData: [{ providerId: 'phone' }]
    },
    {
      uid: 'user5_firebase_uid',
      email: 'user5@example.com',
      displayName: 'Charlie Wilson',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-19T14:20:00Z',
      lastSignInTime: '2024-01-23T09:45:00Z',
      providerData: [{ providerId: 'google.com' }]
    },
    {
      uid: 'user6_firebase_uid',
      email: 'user6@example.com',
      displayName: 'Diana Davis',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-20T11:30:00Z',
      lastSignInTime: '2024-01-24T13:25:00Z',
      providerData: [{ providerId: 'password' }]
    },
    {
      uid: 'user7_firebase_uid',
      email: 'user7@example.com',
      displayName: 'Edward Miller',
      photoURL: null,
      emailVerified: false,
      creationTime: '2024-01-21T08:45:00Z',
      lastSignInTime: '2024-01-23T16:30:00Z',
      providerData: [{ providerId: 'password' }]
    },
    {
      uid: 'user8_firebase_uid',
      email: 'user8@example.com',
      displayName: 'Fiona Garcia',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-22T15:10:00Z',
      lastSignInTime: '2024-01-25T10:15:00Z',
      providerData: [{ providerId: 'google.com' }]
    },
    {
      uid: 'user9_firebase_uid',
      email: 'user9@example.com',
      displayName: 'George Martinez',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-23T09:20:00Z',
      lastSignInTime: '2024-01-26T14:40:00Z',
      providerData: [{ providerId: 'phone' }]
    },
    {
      uid: 'user10_firebase_uid',
      email: 'user10@example.com',
      displayName: 'Hannah Rodriguez',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-24T13:35:00Z',
      lastSignInTime: '2024-01-27T11:55:00Z',
      providerData: [{ providerId: 'password' }]
    },
    {
      uid: 'user11_firebase_uid',
      email: 'user11@example.com',
      displayName: 'Ian Thompson',
      photoURL: null,
      emailVerified: false,
      creationTime: '2024-01-25T10:50:00Z',
      lastSignInTime: '2024-01-26T08:20:00Z',
      providerData: [{ providerId: 'password' }]
    },
    {
      uid: 'user12_firebase_uid',
      email: 'user12@example.com',
      displayName: 'Julia Anderson',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-26T16:15:00Z',
      lastSignInTime: '2024-01-28T12:30:00Z',
      providerData: [{ providerId: 'google.com' }]
    },
    {
      uid: 'user13_firebase_uid',
      email: 'user13@example.com',
      displayName: 'Kevin Taylor',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-27T12:40:00Z',
      lastSignInTime: '2024-01-29T15:45:00Z',
      providerData: [{ providerId: 'phone' }]
    },
    {
      uid: 'user14_firebase_uid',
      email: 'user14@example.com',
      displayName: 'Laura Thomas',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-28T14:25:00Z',
      lastSignInTime: '2024-01-30T09:10:00Z',
      providerData: [{ providerId: 'password' }]
    },
    {
      uid: 'user15_firebase_uid',
      email: 'user15@example.com',
      displayName: 'Michael Jackson',
      photoURL: null,
      emailVerified: true,
      creationTime: '2024-01-29T11:05:00Z',
      lastSignInTime: '2024-01-31T13:20:00Z',
      providerData: [{ providerId: 'google.com' }]
    }
  ]

  const importSingleUser = async (firebaseUser: FirebaseUser) => {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users_extended')
        .select('id, user_id')
        .eq('user_id', firebaseUser.uid)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingUser) {
        return { status: 'skipped', reason: 'User already exists' }
      }

      // Create user_extended record
      const userData = {
        user_id: firebaseUser.uid,
        username: firebaseUser.displayName || `User${firebaseUser.uid.slice(-4)}`,
        level: 1,
        experience_points: 0,
        total_score: 0,
        streak_days: 0,
        last_activity_date: new Date().toISOString().split('T')[0],
        preferred_language: 'java',
        bio: `Imported from Firebase on ${new Date().toLocaleDateString()}`,
        is_premium: false,
        created_at: firebaseUser.creationTime,
        updated_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase
        .from('users_extended')
        .insert([userData])

      if (insertError) {
        throw insertError
      }

      return { status: 'success' }
    } catch (error: any) {
      console.error('Error importing user:', firebaseUser.uid, error)
      return { status: 'failed', error: error.message }
    }
  }

  const handleImportAllUsers = async () => {
    setIsImporting(true)
    setImportProgress({ current: 0, total: mockFirebaseUsers.length })
    setImportResults({ success: 0, failed: 0, skipped: 0, errors: [] })

    const results = { success: 0, failed: 0, skipped: 0, errors: [] as string[] }

    for (let i = 0; i < mockFirebaseUsers.length; i++) {
      const user = mockFirebaseUsers[i]
      setImportProgress({ current: i + 1, total: mockFirebaseUsers.length })

      const result = await importSingleUser(user)

      if (result.status === 'success') {
        results.success++
      } else if (result.status === 'skipped') {
        results.skipped++
      } else {
        results.failed++
        results.errors.push(`${user.email}: ${result.error}`)
      }

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setImportResults(results)
    setIsImporting(false)

    // Show summary toast
    if (results.success > 0) {
      toast.success(`Successfully imported ${results.success} users!`)
    }
    if (results.failed > 0) {
      toast.error(`Failed to import ${results.failed} users`)
    }
    if (results.skipped > 0) {
      toast.info(`Skipped ${results.skipped} existing users`)
    }
  }

  const handleImportCurrentUser = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      toast.error('No current user found')
      return
    }

    setIsImporting(true)
    try {
      const firebaseUser: FirebaseUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
        creationTime: currentUser.metadata.creationTime || new Date().toISOString(),
        lastSignInTime: currentUser.metadata.lastSignInTime || new Date().toISOString(),
        providerData: currentUser.providerData
      }

      const result = await importSingleUser(firebaseUser)
      
      if (result.status === 'success') {
        toast.success('Current user imported successfully!')
        setImportResults(prev => ({ ...prev, success: prev.success + 1 }))
      } else if (result.status === 'skipped') {
        toast.info('Current user already exists in database')
        setImportResults(prev => ({ ...prev, skipped: prev.skipped + 1 }))
      } else {
        toast.error(`Failed to import current user: ${result.error}`)
        setImportResults(prev => ({ 
          ...prev, 
          failed: prev.failed + 1,
          errors: [...prev.errors, `Current user: ${result.error}`]
        }))
      }
    } catch (error: any) {
      toast.error('Error importing current user')
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-100">Firebase User Import</h3>
        </div>
        <p className="text-slate-400 mb-6">
          Import users from Firebase Authentication into the Supabase database. This will create user_extended records for all Firebase users.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleImportCurrentUser}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors disabled:opacity-50"
          >
            <UserPlus className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
            Import Current User
          </button>

          <button
            onClick={handleImportAllUsers}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
            Import All Firebase Users ({mockFirebaseUsers.length})
          </button>
        </div>
      </div>

      {/* Progress */}
      {isImporting && (
        <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <h4 className="text-lg font-semibold text-slate-100">Importing Users...</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-300">
              <span>Progress: {importProgress.current} / {importProgress.total}</span>
              <span>{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
            </div>
            
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {(importResults.success > 0 || importResults.failed > 0 || importResults.skipped > 0) && (
        <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
          <h4 className="text-lg font-semibold text-slate-100 mb-4">Import Results</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{importResults.success}</div>
              <div className="text-sm text-slate-400">Successful</div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{importResults.skipped}</div>
              <div className="text-sm text-slate-400">Skipped</div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400">{importResults.failed}</div>
              <div className="text-sm text-slate-400">Failed</div>
            </div>
          </div>

          {/* Error Details */}
          {importResults.errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-red-400 mb-2">Import Errors:</h5>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResults.errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-300 font-mono">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Firebase Users Preview */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
        <h4 className="text-lg font-semibold text-slate-100 mb-4">
          Firebase Users Preview ({mockFirebaseUsers.length} users)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-600/30 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-3 text-slate-300">Email</th>
                <th className="text-left p-3 text-slate-300">Display Name</th>
                <th className="text-left p-3 text-slate-300">Verified</th>
                <th className="text-left p-3 text-slate-300">Provider</th>
                <th className="text-left p-3 text-slate-300">Created</th>
              </tr>
            </thead>
            <tbody>
              {mockFirebaseUsers.slice(0, 10).map((user, index) => (
                <tr key={user.uid} className="border-b border-slate-700/30 hover:bg-slate-600/20">
                  <td className="p-3 text-slate-300">{user.email}</td>
                  <td className="p-3 text-slate-300">{user.displayName || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.emailVerified 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">
                    {user.providerData[0]?.providerId || 'Unknown'}
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(user.creationTime).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {mockFirebaseUsers.length > 10 && (
            <div className="text-center p-4 text-slate-400 text-sm">
              ... and {mockFirebaseUsers.length - 10} more users
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FirebaseUserImporter