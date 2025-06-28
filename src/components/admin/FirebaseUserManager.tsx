import React, { useState } from 'react'
import { 
  Users, 
  Shield, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  UserX, 
  UserCheck, 
  Trash2, 
  Edit, 
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Crown,
  Calendar,
  Activity,
  TrendingUp,
  UserPlus,
  Settings,
  Database,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useFirebaseUsers, useFirebaseUserStats, FirebaseUserData } from '../../hooks/useFirebaseUsers'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const FirebaseUserManager: React.FC = () => {
  const { currentUser } = useAuth()
  const { users, loading, error, refetch, disableUser, enableUser, deleteUser, setCustomClaims } = useFirebaseUsers()
  const stats = useFirebaseUserStats(users)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled' | 'verified' | 'unverified'>('all')
  const [filterProvider, setFilterProvider] = useState<'all' | 'google' | 'email' | 'phone'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null)
  const [isPerformingAction, setIsPerformingAction] = useState(false)

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !user.disabled) ||
      (filterStatus === 'disabled' && user.disabled) ||
      (filterStatus === 'verified' && user.emailVerified) ||
      (filterStatus === 'unverified' && !user.emailVerified)

    const matchesProvider = 
      filterProvider === 'all' ||
      (filterProvider === 'google' && user.providerData.some(p => p.providerId === 'google.com')) ||
      (filterProvider === 'email' && user.providerData.some(p => p.providerId === 'password')) ||
      (filterProvider === 'phone' && user.providerData.some(p => p.providerId === 'phone'))

    return matchesSearch && matchesStatus && matchesProvider
  })

  const handleDisableUser = async (uid: string) => {
    if (!confirm('Are you sure you want to disable this user? They will not be able to sign in.')) return

    setIsPerformingAction(true)
    try {
      const result = await disableUser(uid)
      if (result.success) {
        toast.success('User disabled successfully')
      } else {
        toast.error(result.error || 'Failed to disable user')
      }
    } catch (error) {
      toast.error('Error disabling user')
    } finally {
      setIsPerformingAction(false)
    }
  }

  const handleEnableUser = async (uid: string) => {
    setIsPerformingAction(true)
    try {
      const result = await enableUser(uid)
      if (result.success) {
        toast.success('User enabled successfully')
      } else {
        toast.error(result.error || 'Failed to enable user')
      }
    } catch (error) {
      toast.error('Error enabling user')
    } finally {
      setIsPerformingAction(false)
    }
  }

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('⚠️ Are you sure you want to permanently delete this user? This action cannot be undone.')) return

    setIsPerformingAction(true)
    try {
      const result = await deleteUser(uid)
      if (result.success) {
        toast.success('User deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete user')
      }
    } catch (error) {
      toast.error('Error deleting user')
    } finally {
      setIsPerformingAction(false)
    }
  }

  const handleSetAdmin = async (uid: string, isAdmin: boolean) => {
    setIsPerformingAction(true)
    try {
      const claims = isAdmin ? { role: 'admin' } : {}
      const result = await setCustomClaims(uid, claims)
      if (result.success) {
        toast.success(isAdmin ? 'User granted admin privileges' : 'Admin privileges removed')
      } else {
        toast.error(result.error || 'Failed to update user privileges')
      }
    } catch (error) {
      toast.error('Error updating user privileges')
    } finally {
      setIsPerformingAction(false)
    }
  }

  const getProviderIcon = (providerData: any[]) => {
    if (providerData.some(p => p.providerId === 'google.com')) {
      return <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
    }
    if (providerData.some(p => p.providerId === 'phone')) {
      return <Phone className="w-4 h-4 text-green-400" />
    }
    return <Mail className="w-4 h-4 text-blue-400" />
  }

  const getProviderLabel = (providerData: any[]) => {
    if (providerData.some(p => p.providerId === 'google.com')) return 'Google'
    if (providerData.some(p => p.providerId === 'phone')) return 'Phone'
    return 'Email'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Loading Firebase Users</h3>
              <p className="text-slate-400">Connecting to Firebase Authentication...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Backend API Required</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            To manage your real Firebase users, you need a backend API with Firebase Admin SDK. 
            Currently showing simulated data representing your 15 Firebase users.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 max-w-lg mx-auto">
            <h4 className="text-blue-400 font-semibold mb-2">To connect to real Firebase users:</h4>
            <ol className="text-sm text-slate-300 text-left space-y-1">
              <li>1. Create a backend API (Node.js, Python, etc.)</li>
              <li>2. Install Firebase Admin SDK</li>
              <li>3. Add endpoints: GET /api/admin/users, POST /api/admin/users/:uid/disable, etc.</li>
              <li>4. Use Firebase Admin SDK to list and manage users</li>
            </ol>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
            <button
              onClick={() => window.open('https://firebase.google.com/docs/admin/setup', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
            >
              <Database className="w-4 h-4" />
              Firebase Admin Docs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">Firebase User Management</h3>
            <p className="text-slate-300">
              {error ? 'Simulated Firebase users (Backend API needed for real data)' : 'Manage all Firebase Authentication users directly'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Demo Mode</span>
              </div>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${error ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
            <span className="text-slate-300 font-medium">
              {error ? 'Simulated Firebase Connection' : 'Connected to Firebase'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Database className="w-4 h-4" />
            <span>{users.length} users loaded</span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-400" />
            <h4 className="font-semibold text-slate-100">Total Users</h4>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
          <div className="text-sm text-slate-400">Firebase Auth users</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h4 className="font-semibold text-slate-100">Verified</h4>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.verifiedUsers}</div>
          <div className="text-sm text-slate-400">{Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}% verified</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h4 className="font-semibold text-slate-100">Active</h4>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.activeUsers}</div>
          <div className="text-sm text-slate-400">{stats.disabledUsers} disabled</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <h4 className="font-semibold text-slate-100">Admins</h4>
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.adminUsers}</div>
          <div className="text-sm text-slate-400">Admin privileges</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <h4 className="font-semibold text-slate-100">Recent</h4>
          </div>
          <div className="text-2xl font-bold text-orange-400">{stats.recentUsers}</div>
          <div className="text-sm text-slate-400">Last 7 days</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by email, name, or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value as any)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Providers</option>
              <option value="google">Google</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">User</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Provider</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Role</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Created</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Last Sign In</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No users found</h3>
                    <p className="text-slate-400">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName || 'User'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {(user.displayName || user.email || 'U')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-100">
                            {user.displayName || 'No name'}
                            {user.uid === currentUser?.uid && (
                              <span className="ml-2 px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                          <div className="text-xs text-slate-500 font-mono">{user.uid.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(user.providerData)}
                        <span className="text-sm text-slate-300">{getProviderLabel(user.providerData)}</span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          user.disabled 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {user.disabled ? 'Disabled' : 'Active'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          user.emailVerified 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {user.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {user.customClaims?.role === 'admin' ? (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-slate-500/20 text-slate-400 rounded-full border border-slate-500/30">
                          User
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm text-slate-300">
                        {new Date(user.creationTime).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(user.creationTime).toLocaleTimeString()}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm text-slate-300">
                        {new Date(user.lastSignInTime).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(user.lastSignInTime).toLocaleTimeString()}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Enable/Disable */}
                        {user.disabled ? (
                          <button
                            onClick={() => handleEnableUser(user.uid)}
                            disabled={isPerformingAction}
                            className="p-2 text-green-400 hover:text-green-300 transition-colors rounded-lg hover:bg-green-500/20 disabled:opacity-50"
                            title="Enable user"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisableUser(user.uid)}
                            disabled={isPerformingAction || user.uid === currentUser?.uid}
                            className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-lg hover:bg-yellow-500/20 disabled:opacity-50"
                            title="Disable user"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}

                        {/* Admin Toggle */}
                        <button
                          onClick={() => handleSetAdmin(user.uid, !user.customClaims?.role)}
                          disabled={isPerformingAction}
                          className={`p-2 transition-colors rounded-lg disabled:opacity-50 ${
                            user.customClaims?.role === 'admin'
                              ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                              : 'text-slate-400 hover:text-purple-400 hover:bg-purple-500/20'
                          }`}
                          title={user.customClaims?.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          disabled={isPerformingAction || user.uid === currentUser?.uid}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/20 disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">G</div>
            <h4 className="text-lg font-semibold text-slate-100">Google Users</h4>
          </div>
          <div className="text-3xl font-bold text-red-400 mb-2">{stats.googleUsers}</div>
          <div className="text-sm text-slate-400">
            {Math.round((stats.googleUsers / stats.totalUsers) * 100)}% of total users
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
            <h4 className="text-lg font-semibold text-slate-100">Email Users</h4>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">{stats.emailUsers}</div>
          <div className="text-sm text-slate-400">
            {Math.round((stats.emailUsers / stats.totalUsers) * 100)}% of total users
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-8 h-8 text-green-400" />
            <h4 className="text-lg font-semibold text-slate-100">Phone Users</h4>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">{stats.phoneUsers}</div>
          <div className="text-sm text-slate-400">
            {Math.round((stats.phoneUsers / stats.totalUsers) * 100)}% of total users
          </div>
        </div>
      </div>

      {/* Backend Setup Guide */}
      {error && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h4 className="text-lg font-semibold text-slate-100 mb-4">🔧 Setup Real Firebase User Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-slate-200 mb-2">Backend API Endpoints Needed:</h5>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• <code className="text-blue-400">GET /api/admin/users</code> - List all users</li>
                <li>• <code className="text-yellow-400">POST /api/admin/users/:uid/disable</code> - Disable user</li>
                <li>• <code className="text-green-400">POST /api/admin/users/:uid/enable</code> - Enable user</li>
                <li>• <code className="text-red-400">DELETE /api/admin/users/:uid</code> - Delete user</li>
                <li>• <code className="text-purple-400">POST /api/admin/users/:uid/claims</code> - Set custom claims</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-2">Firebase Admin SDK Setup:</h5>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Install: <code className="text-blue-400">npm install firebase-admin</code></li>
                <li>• Initialize with service account key</li>
                <li>• Use <code className="text-green-400">admin.auth().listUsers()</code></li>
                <li>• Implement user management operations</li>
                <li>• Add authentication middleware</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FirebaseUserManager