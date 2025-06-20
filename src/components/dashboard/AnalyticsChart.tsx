import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Task, Note, Activity } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format, subDays, startOfDay, isWithinInterval, parseISO } from 'date-fns'

const AnalyticsChart: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: tasks, loading: tasksLoading } = useRealTimeSubscription<Task>('tasks', undefined, currentUser?.uid)
  const { data: notes, loading: notesLoading } = useRealTimeSubscription<Note>('notes', undefined, currentUser?.uid)
  const { data: activities, loading: activitiesLoading } = useRealTimeSubscription<Activity>('activities', undefined, currentUser?.uid)

  const loading = tasksLoading || notesLoading || activitiesLoading

  // Generate weekly activity data from real database data
  const generateWeeklyData = () => {
    const days = 7
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const nextDay = startOfDay(subDays(new Date(), i - 1))
      
      // Count tasks created on this day
      const tasksCreated = tasks.filter(task => {
        const taskDate = parseISO(task.created_at)
        return isWithinInterval(taskDate, { start: date, end: nextDay })
      }).length

      // Count tasks completed on this day
      const tasksCompleted = activities.filter(activity => {
        const activityDate = parseISO(activity.created_at)
        return isWithinInterval(activityDate, { start: date, end: nextDay }) && 
               activity.action === 'task_completed'
      }).length

      // Count notes created on this day
      const notesCreated = notes.filter(note => {
        const noteDate = parseISO(note.created_at)
        return isWithinInterval(noteDate, { start: date, end: nextDay })
      }).length

      data.push({
        date: format(date, 'MMM dd'),
        tasks: tasksCreated,
        notes: notesCreated,
        completed: tasksCompleted,
      })
    }
    
    return data
  }

  // Generate task distribution data from real tasks
  const generateTaskDistribution = () => {
    const todoTasks = tasks.filter(task => task.status === 'todo').length
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    
    const total = todoTasks + inProgressTasks + completedTasks
    
    if (total === 0) {
      return [
        { name: 'No Tasks Yet', value: 1, color: '#6b7280' }
      ]
    }

    return [
      { name: 'Todo', value: todoTasks, color: '#6b7280' },
      { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
      { name: 'Completed', value: completedTasks, color: '#10b981' },
    ].filter(item => item.value > 0)
  }

  // Generate progress trend data from real completion activities
  const generateProgressTrend = () => {
    const days = 7
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const nextDay = startOfDay(subDays(new Date(), i - 1))
      
      // Count completed tasks on this day
      const completedCount = activities.filter(activity => {
        const activityDate = parseISO(activity.created_at)
        return isWithinInterval(activityDate, { start: date, end: nextDay }) && 
               activity.action === 'task_completed'
      }).length

      data.push({
        date: format(date, 'MMM dd'),
        completed: completedCount,
      })
    }
    
    return data
  }

  const chartData = generateWeeklyData()
  const pieData = generateTaskDistribution()
  const trendData = generateProgressTrend()

  const COLORS = ['#6b7280', '#f59e0b', '#10b981']

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Activity Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Weekly Activity (Real Data)</h3>
        {chartData.every(day => day.tasks === 0 && day.notes === 0 && day.completed === 0) ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <BarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No activity data yet. Start creating tasks and notes to see your weekly activity!</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }} 
              />
              <Bar dataKey="tasks" fill="#f97316" name="Tasks Created" />
              <Bar dataKey="completed" fill="#10b981" name="Tasks Completed" />
              <Bar dataKey="notes" fill="#8b5cf6" name="Notes Created" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Trend */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Completion Trend (Real Data)</h3>
          {trendData.every(day => day.completed === 0) ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No completed tasks yet. Complete some tasks to see your progress trend!</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Completed Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Task Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Task Distribution (Real Data)</h3>
          {tasks.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No tasks yet. Create some tasks to see the distribution!</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Real-time Activity Summary */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{tasks.length}</div>
            <div className="text-sm text-slate-400">Total Tasks</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{tasks.filter(t => t.status === 'completed').length}</div>
            <div className="text-sm text-slate-400">Completed</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{notes.length}</div>
            <div className="text-sm text-slate-400">Total Notes</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{activities.length}</div>
            <div className="text-sm text-slate-400">Activities</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsChart