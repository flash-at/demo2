import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useSupabaseAuth() {
  const { currentUser } = useAuth()
  
  useEffect(() => {
    if (currentUser) {
      // Setup Supabase authentication with Firebase token
      setupSupabaseAuth(currentUser)
    }
  }, [currentUser])
}

// Helper function to setup Supabase authentication with Firebase token
async function setupSupabaseAuth(currentUser: any) {
  try {
    // Get the Firebase ID token (JWT)
    const idToken = await currentUser.getIdToken(true) // Force refresh
    
    // Create a custom session for Supabase
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: idToken,
      refresh_token: idToken,
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: {
        id: currentUser.uid,
        email: currentUser.email || '',
        user_metadata: {
          full_name: currentUser.displayName || '',
          avatar_url: currentUser.photoURL || '',
          email: currentUser.email || '',
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: currentUser.metadata.creationTime || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    if (sessionError) {
      console.error('Error setting Supabase session:', sessionError)
      return
    }

    console.log('Successfully authenticated with Supabase:', currentUser.uid)

    // Create user_extended record if it doesn't exist
    await createUserExtendedRecord(currentUser.uid, currentUser.email || '', currentUser.displayName || '')
  } catch (error) {
    console.error('Error setting up Supabase auth:', error)
  }
}

// Helper function to create user_extended record
async function createUserExtendedRecord(userId: string, email: string, displayName: string) {
  try {
    // First try to call the database function
    const { error: functionError } = await supabase.rpc('handle_firebase_user_creation', {
      firebase_uid: userId,
      user_email: email,
      display_name: displayName
    })

    if (functionError) {
      console.error('Error calling user creation function:', functionError)
      
      // Fallback: try direct insert
      const { error: insertError } = await supabase
        .from('users_extended')
        .upsert([{
          user_id: userId,
          username: displayName || `User${userId.slice(-4)}`,
          level: 1,
          experience_points: 0,
          total_score: 0,
          streak_days: 0,
          last_activity_date: new Date().toISOString().split('T')[0],
          preferred_language: 'java',
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'user_id'
        })

      if (insertError) {
        console.error('Error creating user_extended record:', insertError)
      } else {
        console.log('Created user_extended record for:', userId)
      }
    } else {
      console.log('Successfully called user creation function for:', userId)
    }
  } catch (error) {
    console.error('Error in createUserExtendedRecord:', error)
  }
}

// Helper function to get the correct timestamp column for ordering
function getOrderColumn(table: string): string {
  const orderColumns: Record<string, string> = {
    'submissions': 'submitted_at',
    'achievements': 'earned_at',
    'leaderboard': 'last_updated',
  }
  
  return orderColumns[table] || 'created_at'
}

export function useRealTimeSubscription<T>(
  table: string,
  filter?: string,
  userId?: string
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: any

    const fetchData = async () => {
      try {
        setLoading(true)
        let query = supabase.from(table).select('*')
        
        if (userId) {
          query = query.eq('user_id', userId)
        }
        
        if (filter) {
          // Parse filter string like "status.eq.completed"
          const [column, operator, value] = filter.split('.')
          query = query.filter(column, operator, value)
        }

        const orderColumn = getOrderColumn(table)
        const { data: initialData, error } = await query.order(orderColumn, { ascending: false })
        
        if (error) throw error
        
        setData(initialData || [])
        setError(null)
      } catch (err: any) {
        setError(err.message)
        console.error(`Error fetching ${table}:`, err)
        
        // Only show toast for critical errors, not for empty results
        if (!err.message.includes('No rows') && !err.message.includes('not found')) {
          toast.error(`Error loading ${table}: ${err.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    const setupSubscription = () => {
      let channel = supabase.channel(`${table}_changes`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: table,
            filter: userId ? `user_id=eq.${userId}` : undefined
          }, 
          (payload) => {
            console.log(`${table} change received:`, payload)
            
            if (payload.eventType === 'INSERT') {
              setData(prev => [payload.new as T, ...prev])
              if (table !== 'users_extended') { // Don't show toast for user creation
                toast.success(`New ${table.slice(0, -1)} added!`)
              }
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map(item => 
                (item as any).id === payload.new.id ? payload.new as T : item
              ))
              if (table !== 'users_extended') {
                toast.success(`${table.slice(0, -1)} updated!`)
              }
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(item => (item as any).id !== payload.old.id))
              if (table !== 'users_extended') {
                toast.success(`${table.slice(0, -1)} deleted!`)
              }
            }
          }
        )
        .subscribe()

      return channel
    }

    fetchData().then(() => {
      subscription = setupSubscription()
    })

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [table, filter, userId])

  const refetch = () => {
    setLoading(true)
    // The useEffect will handle the refetch
  }

  return { data, loading, error, refetch }
}

export function useSupabaseQuery<T>(
  table: string,
  select: string = '*',
  filter?: any
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        let query = supabase.from(table).select(select)
        
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }

        const { data: result, error } = await query

        if (error) throw error
        
        setData(result || [])
        setError(null)
      } catch (err: any) {
        setError(err.message)
        console.error(`Error fetching ${table}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [table, select, JSON.stringify(filter)])

  return { data, loading, error }
}

// Hook for real-time analytics data
export function useAnalyticsData(userId?: string) {
  const { data: tasks, loading: tasksLoading } = useRealTimeSubscription<any>('tasks', undefined, userId)
  const { data: notes, loading: notesLoading } = useRealTimeSubscription<any>('notes', undefined, userId)
  const { data: activities, loading: activitiesLoading } = useRealTimeSubscription<any>('activities', undefined, userId)

  const loading = tasksLoading || notesLoading || activitiesLoading

  // Calculate real-time metrics
  const metrics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task: any) => task.status === 'completed').length,
    pendingTasks: tasks.filter((task: any) => task.status !== 'completed').length,
    totalNotes: notes.length,
    favoriteNotes: notes.filter((note: any) => note.is_favorite).length,
    totalActivities: activities.length,
    highPriorityTasks: tasks.filter((task: any) => task.priority === 'high' && task.status !== 'completed').length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter((task: any) => task.status === 'completed').length / tasks.length) * 100) : 0,
    totalScore: tasks.filter((task: any) => task.status === 'completed').length * 10 + notes.length * 5 // Simple scoring
  }

  return { tasks, notes, activities, metrics, loading }
}