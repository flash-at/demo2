import React, { useState, useEffect } from 'react'
import { 
  Users, 
  UserX, 
  UserCheck, 
  Edit, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Search,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Ban,
  Key,
  X,
  Save
} from 'lucide-react'
import { useFirebaseAdmin, FirebaseUser } from '../../hooks/useFirebaseAdmin'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const FirebaseUserManager: React.FC = () => {
  const { currentUser } = useAuth()
  const { 
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
  } = useFirebaseAdmin()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<FirebaseUser | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: '',
    emailVerified: false
  })

  const [editForm, setEditForm] = useState({
    email: '',
    displayName: '',
    phoneNumber: '',
    emailVerified: false,
    disabled: false
  })

  useEffect(() => {
    checkApiHealth().then(setApiHealthy)
  }, [])

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.uid.toLowerCase().includes(searchLower)
    )
  })

  const handleDisableUser = async (uid: string) => {
    if (!confirm('Are you sure you want to disable this user?')) return
    
    setActionLoading(`disable-${uid}`)
    try {
      await disableUser(uid)
      toast.success('User disabled successfully')
    } catch (error: any) {
      toast.error(`Failed to disable user: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEnableUser = async (uid: string) => {
    setActionLoading(`enable-${uid}`)
    try {
      await enableUser(uid)
      toast.success('User enabled successfully')
    } catch (error: any) {
      toast.error(`Failed to enable user: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return
    
    setActionLoading(`delete-${uid}`)
    try {
      await deleteUser(uid)
      toast.success('User deleted successfully')
      setSelectedUser(null)
      setShowUserDetails(false)
    } catch (error: any) {
      toast.error(`Failed to delete user: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRevokeTokens = async (uid: string) => {
    if (!confirm('Are you sure you want to revoke all refresh tokens for this user? They will need to sign in again.')) return
    
    setActionLoading(`revoke-${uid}`)
    try {
      await revokeTokens(uid)
      toast.success('User tokens revoked successfully')
    } catch (error: any) {
      toast.error(`Failed to revoke tokens: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.email || !createForm.password) {
      toast.error('Email and password are required')
      return
    }

    setActionLoading('create')
    try {
      await createUser(createForm)
      toast.success('User created successfully')
      setShowCreateForm(false)
      setCreateForm({
        email: '',
        password: '',
        displayName: '',
        phoneNumber: '',
        emailVerified: false
      })
    } catch (error: any) {
      toast.error(`Failed to create user: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser) return

    setActionLoading('update')
    try {
      await updateUser(selectedUser.uid, editForm)
      toast.success('User updated successfully')
      setSelectedUser(null)
      setShowUserDetails(false)
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const openUserDetails = (user: FirebaseUser) => {
    setSelectedUser(user)
    setEditForm({
      email: user.email || '',
      displayName: user.displayName || '',
      phoneNumber: user.phoneNumber || '',
      emailVerified: user.emailVerified,
      disabled: user.disabled
    })
    setShowUserDetails(true)
  }

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google.com':
        return '🔍'
      case 'phone':
        return '📱'
      case 'password':
        return '🔐'
      default:
        return '🔗'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (apiHealthy === false) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">API Server Not Available</h3>
          <p className="text-slate-400 mb-6">
            The Firebase Admin API server is not running. Please start the API server to manage users.
          </p>
          <div className="bg-slate-700/50 rounded-lg p-4 text-left max-w-2xl mx-auto">
            <h4 className="font-semibold text-slate-200 mb-2">To start the API server:</h4>
            <ol className="text-sm text-slate-300 space-y-1">
              <li>1. Navigate to the <code className="bg-slate-600 px-1 rounded">api</code> directory</li>
              <li>2. Install dependencies: <code className="bg-slate-600 px-1 rounded">npm install</code></li>
              <li>3. Set up environment variables (see api/README.md)</li>
              <li>4. Start the server: <code className="bg-slate-600 px-1 rounded">npm run dev</code></li>
            </ol>
          </div>
          <button
            onClick={() => checkApiHealth().then(setApiHealthy)}
            className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Check Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Firebase User Management</h2>
            <p className="text-slate-400">Manage real Firebase users directly from your project</p>
            {apiHealthy && (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">API Server Connected</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create User
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by email, name, or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium">Error loading users</span>
          </div>
          <p className="text-red-300 mt-1">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-slate-400 animate-spin" />
            <p className="text-slate-400">Loading Firebase users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              {users.length === 0 ? 'No Firebase users found' : 'No users match your search'}
            </h3>
            <p className="text-slate-400">
              {users.length === 0 
                ? 'Create your first user or check if the API server is running correctly.'
                : 'Try adjusting your search terms.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">User</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Providers</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Created</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Last Sign In</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <span className="text-white text-sm font-bold">
                              {(user.displayName || user.email || 'U')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-100">
                            {user.displayName || 'No name'}
                          </div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                          <div className="text-xs text-slate-500 font-mono">{user.uid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                          user.disabled 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user.disabled ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {user.disabled ? 'Disabled' : 'Active'}
                        </span>
                        <div className="flex items-center gap-1">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                              <Mail className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.providerData.map((provider, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-600/50 text-slate-300 rounded"
                            title={provider.providerId}
                          >
                            {getProviderIcon(provider.providerId)}
                            {provider.providerId.replace('.com', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">
                        {formatDate(user.creationTime)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">
                        {formatDate(user.lastSignInTime)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openUserDetails(user)}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-600/50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {user.disabled ? (
                          <button
                            onClick={() => handleEnableUser(user.uid)}
                            disabled={actionLoading === `enable-${user.uid}`}
                            className="p-2 text-slate-400 hover:text-green-400 transition-colors rounded-lg hover:bg-slate-600/50 disabled:opacity-50"
                            title="Enable User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisableUser(user.uid)}
                            disabled={actionLoading === `disable-${user.uid}`}
                            className="p-2 text-slate-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-slate-600/50 disabled:opacity-50"
                            title="Disable User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          disabled={actionLoading === `delete-${user.uid}`}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-600/50 disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Create New User</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                <input
                  type="text"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                  placeholder="+1234567890"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emailVerified"
                  checked={createForm.emailVerified}
                  onChange={(e) => setCreateForm({ ...createForm, emailVerified: e.target.checked })}
                  className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="emailVerified" className="text-sm text-slate-300">
                  Email verified
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading === 'create'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'create' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">User Details</h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* User Info */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {selectedUser.photoURL ? (
                      <img 
                        src={selectedUser.photoURL} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {(selectedUser.displayName || selectedUser.email || 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-100">
                      {selectedUser.displayName || 'No name'}
                    </h4>
                    <p className="text-slate-400">{selectedUser.email}</p>
                    <p className="text-xs text-slate-500 font-mono">{selectedUser.uid}</p>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => handleRevokeTokens(selectedUser.uid)}
                    disabled={actionLoading === `revoke-${selectedUser.uid}`}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-colors disabled:opacity-50 text-sm"
                  >
                    <Key className="w-4 h-4" />
                    Revoke Tokens
                  </button>
                  
                  {selectedUser.disabled ? (
                    <button
                      onClick={() => handleEnableUser(selectedUser.uid)}
                      disabled={actionLoading === `enable-${selectedUser.uid}`}
                      className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      Enable User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDisableUser(selectedUser.uid)}
                      disabled={actionLoading === `disable-${selectedUser.uid}`}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors disabled:opacity-50 text-sm"
                    >
                      <UserX className="w-4 h-4" />
                      Disable User
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteUser(selectedUser.uid)}
                    disabled={actionLoading === `delete-${selectedUser.uid}`}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="editEmailVerified"
                        checked={editForm.emailVerified}
                        onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                        className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor="editEmailVerified" className="text-sm text-slate-300">
                        Email verified
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="editDisabled"
                        checked={editForm.disabled}
                        onChange={(e) => setEditForm({ ...editForm, disabled: e.target.checked })}
                        className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor="editDisabled" className="text-sm text-slate-300">
                        Account disabled
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Metadata Display */}
                <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                  <h5 className="font-medium text-slate-200 mb-3">Account Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Created:</span>
                      <span className="text-slate-200 ml-2">{formatDate(selectedUser.creationTime)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Sign In:</span>
                      <span className="text-slate-200 ml-2">{formatDate(selectedUser.lastSignInTime)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Providers:</span>
                      <div className="ml-2 flex flex-wrap gap-1 mt-1">
                        {selectedUser.providerData.map((provider, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-600/50 text-slate-300 rounded"
                          >
                            {getProviderIcon(provider.providerId)}
                            {provider.providerId}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedUser.customClaims && Object.keys(selectedUser.customClaims).length > 0 && (
                      <div>
                        <span className="text-slate-400">Custom Claims:</span>
                        <pre className="text-slate-200 ml-2 text-xs bg-slate-800 p-2 rounded mt-1">
                          {JSON.stringify(selectedUser.customClaims, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading === 'update'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'update' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Update User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUserDetails(false)}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FirebaseUserManager