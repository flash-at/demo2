import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useSupabaseAuth() {
  const { currentUser } = useAuth()
  
  useEffect(() => {
    if (currentUser) {
      // Set Supabase auth session when Firebase user is available
      supabase.auth.setSession({
        access_token: currentUser.uid,
        refresh_token: currentUser.uid,
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: currentUser.uid,
          email: currentUser.email || '',
          user_metadata: {
            full_name: currentUser.displayName || '',
            avatar_url: currentUser.photoURL || '',
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: currentUser.metadata.creationTime || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    }
  }, [currentUser])
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

        const { data: initialData, error } = await query.order('created_at', { ascending: false })
        
        if (error) throw error
        
        setData(initialData || [])
        setError(null)
      } catch (err: any) {
        setError(err.message)
        toast.error(`Error fetching ${table}: ${err.message}`)
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
              toast.success(`New ${table.slice(0, -1)} added!`)
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map(item => 
                (item as any).id === payload.new.id ? payload.new as T : item
              ))
              toast.success(`${table.slice(0, -1)} updated!`)
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(item => (item as any).id !== payload.old.id))
              toast.success(`${table.slice(0, -1)} deleted!`)
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

  return { data, loading, error, refetch: () => setLoading(true) }
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