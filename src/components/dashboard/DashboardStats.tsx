import React from 'react'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Users,
  FileText,
  Star,
  Activity
} from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Task, Note, Activity as ActivityType } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const DashboardStats: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: tasks } = useRealTimeSubscription<Task>('tasks', undefined, currentUser?.uid)
  const { data: notes } = useRealTimeSubscription<Note>('notes', undefined, currentUser?.uid)
  const { data: activities } = useRealTimeSubscription<ActivityType>('activities', undefined, currentUser?.uid)

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const pendingTasks = tasks.filter(task => task.status !== 'completed').length
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && task.status !== 'completed').length
  const favoriteNotes = notes.filter(note => note.is_favorite).length

  const stats = [
    {
      title: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      title: 'High Priority',
      value: highPriorityTasks,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      title: 'Total Notes',
      value: notes.length,
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Favorite Notes',
      value: favoriteNotes,
      icon: Star,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Recent Activities',
      value: activities.length,
      icon: Activity,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color} mt-2`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DashboardStats