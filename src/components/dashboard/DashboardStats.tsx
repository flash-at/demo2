import React from 'react'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Users,
  FileText,
  Star,
  Activity,
  Target,
  Calendar
} from 'lucide-react'
import { useAnalyticsData } from '../../hooks/useSupabase'
import { useAuth } from '../../contexts/AuthContext'

const DashboardStats: React.FC = () => {
  const { currentUser } = useAuth()
  const { metrics, loading } = useAnalyticsData(currentUser?.uid)

  const stats = [
    {
      title: 'Total Tasks',
      value: metrics.totalTasks,
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      change: metrics.totalTasks > 0 ? '+' + metrics.totalTasks : '0'
    },
    {
      title: 'Completed Tasks',
      value: metrics.completedTasks,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      change: `${metrics.completionRate}% rate`
    },
    {
      title: 'Pending Tasks',
      value: metrics.pendingTasks,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      change: metrics.pendingTasks > 0 ? `${metrics.pendingTasks} remaining` : 'All done!'
    },
    {
      title: 'High Priority',
      value: metrics.highPriorityTasks,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      change: metrics.highPriorityTasks > 0 ? 'Needs attention' : 'Under control'
    },
    {
      title: 'Total Notes',
      value: metrics.totalNotes,
      icon: FileText,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      change: metrics.totalNotes > 0 ? `${metrics.totalNotes} created` : 'Start writing'
    },
    {
      title: 'Favorite Notes',
      value: metrics.favoriteNotes,
      icon: Star,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      change: metrics.favoriteNotes > 0 ? `${metrics.favoriteNotes} starred` : 'None yet'
    },
    {
      title: 'Activities Today',
      value: metrics.totalActivities,
      icon: Activity,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      change: metrics.totalActivities > 0 ? 'Active user' : 'Get started'
    },
    {
      title: 'Completion Rate',
      value: `${metrics.completionRate}%`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      change: metrics.completionRate >= 70 ? 'Excellent!' : metrics.completionRate >= 40 ? 'Good progress' : 'Keep going!'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-8 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
              <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            
            {/* Progress indicator for completion rate */}
            {stat.title === 'Completion Rate' && metrics.totalTasks > 0 && (
              <div className="mt-4">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.completionRate}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DashboardStats