import React, { useState, useEffect } from 'react'
import { Bell, X, Check, AlertTriangle, Info, Star, Trophy, Gift, Clock } from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Task, Achievement, Reward } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'task_due' | 'achievement' | 'reward' | 'system' | 'reminder'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  metadata?: any
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  unreadCount: number
  onMarkAllRead: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  unreadCount,
  onMarkAllRead
}) => {
  const { currentUser } = useAuth()
  const { data: tasks } = useRealTimeSubscription<Task>('tasks', undefined, currentUser?.uid)
  const { data: achievements } = useRealTimeSubscription<Achievement>('achievements', undefined, currentUser?.uid)
  const { data: rewards } = useRealTimeSubscription<Reward>('rewards', undefined, currentUser?.uid)
  
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Generate notifications from real data
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = []

      // Task due notifications
      const dueTasks = tasks.filter(task => {
        if (!task.due_date || task.status === 'completed') return false
        const dueDate = new Date(task.due_date)
        const today = new Date()
        const diffTime = dueDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 1 && diffDays >= 0
      })

      dueTasks.forEach(task => {
        const dueDate = new Date(task.due_date!)
        const isOverdue = dueDate < new Date()
        
        newNotifications.push({
          id: `task-due-${task.id}`,
          type: 'task_due',
          title: isOverdue ? 'Task Overdue!' : 'Task Due Soon',
          message: `"${task.title}" ${isOverdue ? 'was due' : 'is due'} ${format(dueDate, 'MMM dd, yyyy')}`,
          timestamp: task.updated_at,
          read: false,
          priority: isOverdue ? 'high' : 'medium',
          metadata: { taskId: task.id }
        })
      })

      // Achievement notifications
      achievements.slice(0, 5).forEach(achievement => {
        newNotifications.push({
          id: `achievement-${achievement.id}`,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `You earned "${achievement.title}" (+${achievement.points_awarded} points)`,
          timestamp: achievement.earned_at,
          read: false,
          priority: 'medium',
          metadata: { achievementId: achievement.id }
        })
      })

      // Reward notifications
      const unclaimedRewards = rewards.filter(r => !r.is_claimed).slice(0, 3)
      unclaimedRewards.forEach(reward => {
        newNotifications.push({
          id: `reward-${reward.id}`,
          type: 'reward',
          title: 'New Reward Available!',
          message: `You have a new ${reward.type}: "${reward.title}"`,
          timestamp: reward.created_at,
          read: false,
          priority: 'medium',
          metadata: { rewardId: reward.id }
        })
      })

      // System notifications
      if (tasks.length === 0) {
        newNotifications.push({
          id: 'welcome-tasks',
          type: 'system',
          title: 'Welcome to CodeCafe!',
          message: 'Create your first task to start organizing your work',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'low'
        })
      }

      if (tasks.filter(t => t.status === 'completed').length >= 5) {
        newNotifications.push({
          id: 'productivity-milestone',
          type: 'system',
          title: 'Productivity Milestone!',
          message: 'You\'ve completed 5+ tasks! Keep up the great work!',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'low'
        })
      }

      // Sort by timestamp (newest first)
      newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setNotifications(newNotifications)
    }

    generateNotifications()
  }, [tasks, achievements, rewards])

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'task_due':
        return priority === 'high' ? 
          <AlertTriangle className="w-5 h-5 text-red-400" /> : 
          <Clock className="w-5 h-5 text-yellow-400" />
      case 'achievement':
        return <Trophy className="w-5 h-5 text-purple-400" />
      case 'reward':
        return <Gift className="w-5 h-5 text-green-400" />
      case 'system':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Bell className="w-5 h-5 text-slate-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-500/5'
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/5'
      case 'low': return 'border-l-blue-500 bg-blue-500/5'
      default: return 'border-l-slate-500 bg-slate-500/5'
    }
  }

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true })
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else {
      return format(date, 'MMM dd')
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onMarkAllRead()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-16">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-semibold text-slate-100">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        {notifications.some(n => !n.read) && (
          <div className="p-4 border-b border-slate-700/50">
            <button
              onClick={markAllAsRead}
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No notifications</h3>
              <p className="text-slate-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-700/20 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-slate-700/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          notification.read ? 'text-slate-300' : 'text-slate-100'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-2 p-1 text-slate-400 hover:text-green-400 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        notification.read ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {formatNotificationTime(notification.timestamp)}
                        </span>
                        
                        {notification.priority === 'high' && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
          <p className="text-xs text-slate-400 text-center">
            Notifications are updated in real-time
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter