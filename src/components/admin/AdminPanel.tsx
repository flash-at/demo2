import React, { useState } from 'react'
import { 
  Users, 
  BookOpen, 
  Code, 
  Settings, 
  BarChart3, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Course, Problem, UserExtended, AdminUser } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const AdminPanel: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: courses, loading: coursesLoading } = useRealTimeSubscription<Course>('courses', undefined)
  const { data: problems, loading: problemsLoading } = useRealTimeSubscription<Problem>('problems', undefined)
  const { data: users, loading: usersLoading } = useRealTimeSubscription<UserExtended>('users_extended', undefined)
  const { data: admins, loading: adminsLoading } = useRealTimeSubscription<AdminUser>('admin_users', undefined)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'problems' | 'admins'>('overview')

  const loading = coursesLoading || problemsLoading || usersLoading || adminsLoading

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'problems', label: 'Problems', icon: Code },
    { id: 'admins', label: 'Admins', icon: Shield }
  ]

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-100">Total Users</h3>
        </div>
        <div className="text-3xl font-bold text-blue-400">{users.length}</div>
        <div className="text-sm text-slate-400 mt-2">Registered learners</div>
      </div>

      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-green-400" />
          <h3 className="text-lg font-semibold text-slate-100">Courses</h3>
        </div>
        <div className="text-3xl font-bold text-green-400">{courses.length}</div>
        <div className="text-sm text-slate-400 mt-2">
          {courses.filter(c => c.is_published).length} published
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-8 h-8 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-100">Problems</h3>
        </div>
        <div className="text-3xl font-bold text-purple-400">{problems.length}</div>
        <div className="text-sm text-slate-400 mt-2">
          {problems.filter(p => p.is_published).length} published
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-orange-400" />
          <h3 className="text-lg font-semibold text-slate-100">Admins</h3>
        </div>
        <div className="text-3xl font-bold text-orange-400">{admins.length}</div>
        <div className="text-sm text-slate-400 mt-2">Active administrators</div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-100">User Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-slate-700/30 rounded-xl border border-slate-600/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">User</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Level</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Points</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {(user.username || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-100">
                          {user.username || `User ${user.user_id.slice(-4)}`}
                        </div>
                        <div className="text-sm text-slate-400">{user.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{user.level}</td>
                  <td className="p-4 text-slate-300">{user.total_score}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.is_premium 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.is_premium ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-green-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-100">Course Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors">
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-100">{course.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                course.is_published 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4">{course.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>{course.category}</span>
              <span>{course.difficulty}</span>
              <span>{course.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                Edit
              </button>
              <button className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/30 hover:bg-red-500/30 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProblems = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-100">Problem Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors">
          <Plus className="w-4 h-4" />
          Add Problem
        </button>
      </div>

      <div className="bg-slate-700/30 rounded-xl border border-slate-600/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Problem</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Difficulty</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Category</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Points</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="font-medium text-slate-100">{problem.title}</div>
                    <div className="text-sm text-slate-400 line-clamp-1">{problem.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 capitalize">{problem.category.replace('-', ' ')}</td>
                  <td className="p-4 text-slate-300">{problem.points}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      problem.is_published 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {problem.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-green-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAdmins = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-100">Admin Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors">
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      <div className="bg-slate-700/30 rounded-xl border border-slate-600/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Admin</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Role</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Created</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-100">{admin.user_id}</div>
                        <div className="text-sm text-slate-400">Administrator</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      admin.role === 'super_admin' ? 'bg-red-500/20 text-red-400' :
                      admin.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {admin.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-green-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'users': return renderUsers()
      case 'courses': return renderCourses()
      case 'problems': return renderProblems()
      case 'admins': return renderAdmins()
      default: return renderOverview()
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Admin Panel</h2>
            <p className="text-slate-400">Manage users, content, and platform settings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminPanel