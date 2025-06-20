import React from 'react'
import { Activity, Clock, CheckCircle, FileText, Star, Trash2 } from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Activity as ActivityType } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format, formatDistanceToNow } from 'date-fns'

const ActivityFeed: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: activities, loading } = useRealTimeSubscription<ActivityType>('activities', undefined, currentUser?.uid)

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'task_created':
      case 'task_updated':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'note_created':
      case 'note_updated':
        return <FileText className="w-4 h-4 text-purple-400" />
      case 'note_favorited':
        return <Star className="w-4 h-4 text-yellow-400" />
      case 'item_deleted':
        return <Trash2 className="w-4 h-4 text-red-400" />
      default:
        return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'task_created':
      case 'task_updated':
        return 'border-green-500/20 bg-green-500/5'
      case 'task_completed':
        return 'border-blue-500/20 bg-blue-500/5'
      case 'note_created':
      case 'note_updated':
        return 'border-purple-500/20 bg-purple-500/5'
      case 'note_favorited':
        return 'border-yellow-500/20 bg-yellow-500/5'
      case 'item_deleted':
        return 'border-red-500/20 bg-red-500/5'
      default:
        return 'border-slate-600/20 bg-slate-700/5'
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded mb-1"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-orange-400" />
        <h2 className="text-xl font-semibold text-slate-100">Recent Activity</h2>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity. Start creating tasks and notes to see your activity here!</p>
          </div>
        ) : (
          activities.slice(0, 20).map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${getActivityColor(activity.action)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium">
                  {activity.description}
                </p>
                
                {activity.metadata && (
                  <div className="mt-1 text-xs text-slate-400">
                    {activity.metadata.title && (
                      <span className="font-medium">"{activity.metadata.title}"</span>
                    )}
                    {activity.metadata.status && (
                      <span className="ml-2 px-2 py-0.5 bg-slate-600/50 rounded text-xs">
                        {activity.metadata.status}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span title={format(new Date(activity.created_at), 'PPpp')}>
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 20 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            Showing latest 20 activities • {activities.length} total
          </p>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed