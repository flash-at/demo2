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
  TrendingUp,
  BookOpen,
  Code,
  Trophy,
  Gift,
  Users,
  Shield,
  Star,
  Target,
  Award,
  Calendar,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useSupabaseAuth, useAnalyticsData } from '../hooks/useSupabase'
import DashboardStats from '../components/dashboard/DashboardStats'
import TaskManager from '../components/dashboard/TaskManager'
import NotesManager from '../components/dashboard/NotesManager'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import AnalyticsChart from '../components/dashboard/AnalyticsChart'
import CoursesManager from '../components/learning/CoursesManager'
import ProblemsManager from '../components/learning/ProblemsManager'
import LeaderboardView from '../components/learning/LeaderboardView'
import RewardsManager from '../components/learning/RewardsManager'
import AdminPanel from '../components/admin/AdminPanel'
import toast, { Toaster } from 'react-hot-toast'

type ActiveTab = 'overview' | 'tasks' | 'notes' | 'analytics' | 'activity' | 'courses' | 'problems' | 'leaderboard' | 'rewards' | 'admin'

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  // Initialize Supabase auth and get real-time data
  useSupabaseAuth()
  const { metrics, loading: metricsLoading } = useAnalyticsData(currentUser?.uid)

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser?.email) {
        // Check if user is admin - using the specified admin email
        const adminEmails = ['maheshch1094@gmail.com', 'admin@codecafe.com', 'superadmin@codecafe.com']
        setIsAdmin(adminEmails.includes(currentUser.email.toLowerCase()))
      }
    }
    checkAdminStatus()
  }, [currentUser])

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
      badge: null,
      section: 'main'
    },
    { 
      id: 'tasks', 
      label: 'Tasks', 
      icon: CheckSquare,
      badge: metrics.pendingTasks > 0 ? metrics.pendingTasks : null,
      section: 'productivity'
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: FileText,
      badge: metrics.totalNotes > 0 ? metrics.totalNotes : null,
      section: 'productivity'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp,
      badge: null,
      section: 'productivity'
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: Activity,
      badge: metrics.totalActivities > 0 ? metrics.totalActivities : null,
      section: 'productivity'
    },
    { 
      id: 'courses', 
      label: 'Courses', 
      icon: BookOpen,
      badge: null,
      section: 'learning'
    },
    { 
      id: 'problems', 
      label: 'Problems', 
      icon: Code,
      badge: null,
      section: 'learning'
    },
    { 
      id: 'leaderboard', 
      label: 'Leaderboard', 
      icon: Trophy,
      badge: null,
      section: 'learning'
    },
    { 
      id: 'rewards', 
      label: 'Rewards', 
      icon: Gift,
      badge: null,
      section: 'learning'
    },
  ]

  // Add admin section if user is admin
  if (isAdmin) {
    sidebarItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      badge: null,
      section: 'admin'
    })
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/30">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-2">
              Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-lg text-slate-300 mb-4">
              Ready to continue your coding journey?
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-300">Level {Math.floor(metrics.totalScore / 100) + 1}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full">
                <Star className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-slate-300">{metrics.totalScore} Points</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">{metrics.completionRate}% Success</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-28 h-28 rounded-full border-4 border-white/20"
                />
              ) : (
                <User className="w-16 h-16 text-white" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-900">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('tasks')}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group"
        >
          <CheckSquare className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-100 mb-1">Quick Task</h3>
          <p className="text-sm text-slate-400">Add new task</p>
        </button>
        
        <button
          onClick={() => setActiveTab('notes')}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group"
        >
          <FileText className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-100 mb-1">Quick Note</h3>
          <p className="text-sm text-slate-400">Jot down ideas</p>
        </button>
        
        <button
          onClick={() => setActiveTab('problems')}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group"
        >
          <Code className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-100 mb-1">Solve Problem</h3>
          <p className="text-sm text-slate-400">Practice coding</p>
        </button>
        
        <button
          onClick={() => setActiveTab('courses')}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group"
        >
          <BookOpen className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-100 mb-1">Learn</h3>
          <p className="text-sm text-slate-400">Take courses</p>
        </button>
      </div>

      {/* Stats Dashboard */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Tasks */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-100">Recent Tasks</h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                View All →
              </button>
            </div>
            <TaskManager />
          </div>

          {/* Progress Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Weekly Progress</h3>
            <AnalyticsChart />
          </div>
        </div>

        <div className="space-y-8">
          {/* Activity Feed */}
          <ActivityFeed />

          {/* Quick Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Today's Goals</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Complete 3 tasks</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: `${Math.min((metrics.completedTasks / 3) * 100, 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-400">{Math.min(metrics.completedTasks, 3)}/3</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Write 2 notes</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${Math.min((metrics.totalNotes / 2) * 100, 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-400">{Math.min(metrics.totalNotes, 2)}/2</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Solve 1 problem</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700 rounded-full h-2">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-xs text-slate-400">0/1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Recent Achievements</h3>
              <button
                onClick={() => setActiveTab('rewards')}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">First Task Completed</p>
                  <p className="text-xs text-slate-400">+10 points</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">Note Taker</p>
                  <p className="text-xs text-slate-400">+5 points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'tasks':
        return <TaskManager />
      case 'notes':
        return <NotesManager />
      case 'analytics':
        return <AnalyticsChart />
      case 'activity':
        return <ActivityFeed />
      case 'courses':
        return <CoursesManager />
      case 'problems':
        return <ProblemsManager />
      case 'leaderboard':
        return <LeaderboardView />
      case 'rewards':
        return <RewardsManager />
      case 'admin':
        return isAdmin ? <AdminPanel /> : <div className="text-center text-slate-400">Access Denied</div>
      default:
        return renderOverview()
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
      case 'courses':
        return 'Learning Courses'
      case 'problems':
        return 'Coding Problems'
      case 'leaderboard':
        return 'Leaderboard'
      case 'rewards':
        return 'Rewards & Achievements'
      case 'admin':
        return 'Admin Panel'
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
      case 'courses':
        return 'Learn Java, Python, DSA and more with interactive courses.'
      case 'problems':
        return 'Solve coding problems and improve your programming skills.'
      case 'leaderboard':
        return 'See how you rank against other learners.'
      case 'rewards':
        return 'Earn points, badges, and unlock achievements.'
      case 'admin':
        return 'Manage users, courses, problems, and platform settings.'
      default:
        return 'Manage your productivity and learning'
    }
  }

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'main': return null
      case 'productivity': return 'Productivity'
      case 'learning': return 'Learning'
      case 'admin': return 'Administration'
      default: return null
    }
  }

  const groupedItems = sidebarItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = []
    }
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, typeof sidebarItems>)

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
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full mt-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
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
          <nav className="flex-1 p-4 overflow-y-auto">
            {Object.entries(groupedItems).map(([section, items]) => (
              <div key={section} className="mb-6">
                {getSectionTitle(section) && (
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                    {getSectionTitle(section)}
                  </h3>
                )}
                <ul className="space-y-2">
                  {items.map((item) => {
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
              </div>
            ))}
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
                  placeholder="Search tasks, notes, courses..."
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