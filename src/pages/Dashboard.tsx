import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LogOut, 
  User, 
  Settings, 
  BarChart3, 
  CheckSquare, 
  FileText, 
  Activity,
  Bell,
  Search,
  Menu,
  X,
  Home,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useSupabaseAuth, useAnalyticsData } from '../hooks/useSupabase'
import DashboardStats from '../components/dashboard/DashboardStats'
import TaskManager from '../components/dashboard/TaskManager'
import NotesManager from '../components/dashboard/NotesManager'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import AnalyticsChart from '../components/dashboard/AnalyticsChart'
import toast, { Toaster } from 'react-hot-toast'

type ActiveTab = 'overview' | 'tasks' | 'notes' | 'analytics' | 'activity'

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize Supabase auth and get real-time data
  useSupabaseAuth()
  const { metrics, loading: metricsLoading } = useAnalyticsData(currentUser?.uid)

  const handleLogout = async () => {
    try {
      await logout()
      showToast('Logged out successfully', 'success')
      navigate('/auth')
    } catch (error: any) {
      showToast('Failed to log out', 'error')
    }
  }

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Home,
      badge: null
    },
    { 
      id: 'tasks', 
      label: 'Tasks', 
      icon: CheckSquare,
      badge: metrics.pendingTasks > 0 ? metrics.pendingTasks : null
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: FileText,
      badge: metrics.totalNotes > 0 ? metrics.totalNotes : null
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp,
      badge: null
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: Activity,
      badge: metrics.totalActivities > 0 ? metrics.totalActivities : null
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <DashboardStats />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <TaskManager />
              </div>
              <div>
                <ActivityFeed />
              </div>
            </div>
          </div>
        )
      case 'tasks':
        return <TaskManager />
      case 'notes':
        return <NotesManager />
      case 'analytics':
        return <AnalyticsChart />
      case 'activity':
        return <ActivityFeed />
      default:
        return <DashboardStats />
    }
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Dashboard Overview'
      case 'tasks':
        return `Tasks (${metrics.totalTasks})`
      case 'notes':
        return `Notes (${metrics.totalNotes})`
      case 'analytics':
        return 'Analytics & Reports'
      case 'activity':
        return `Activity Feed (${metrics.totalActivities})`
      default:
        return 'Dashboard'
    }
  }

  const getPageDescription = () => {
    switch (activeTab) {
      case 'overview':
        return `Welcome back, ${currentUser?.displayName || 'User'}! Here's your productivity overview.`
      case 'tasks':
        return `Manage your tasks. ${metrics.completedTasks} completed, ${metrics.pendingTasks} pending.`
      case 'notes':
        return `Your notes collection. ${metrics.favoriteNotes} favorites out of ${metrics.totalNotes} total.`
      case 'analytics':
        return `Insights and analytics. ${metrics.completionRate}% completion rate.`
      case 'activity':
        return `Recent activity feed. Stay updated with all your actions.`
      default:
        return 'Manage your productivity'
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                CodeCafe
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">
                  {currentUser.displayName || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            {!metricsLoading && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/30 rounded p-2 text-center">
                  <div className="text-green-400 font-bold">{metrics.completedTasks}</div>
                  <div className="text-slate-400">Completed</div>
                </div>
                <div className="bg-slate-700/30 rounded p-2 text-center">
                  <div className="text-orange-400 font-bold">{metrics.completionRate}%</div>
                  <div className="text-slate-400">Success Rate</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id as ActiveTab)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </div>
                      {item.badge && (
                        <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h2 className="text-xl font-semibold text-slate-100">
                  {getPageTitle()}
                </h2>
                <p className="text-sm text-slate-400">
                  {getPageDescription()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
                <Bell className="w-5 h-5" />
                {metrics.highPriorityTasks > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{metrics.highPriorityTasks}</span>
                  </span>
                )}
              </button>

              {/* Settings */}
              <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard