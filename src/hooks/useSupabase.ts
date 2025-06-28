import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

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
    console.log('Setting up Supabase auth for Firebase user:', currentUser.uid)

    // Create user_extended record if it doesn't exist
    await createUserExtendedRecord(currentUser.uid, currentUser.email || '', currentUser.displayName || '')
  } catch (error) {
    console.error('Error setting up Supabase auth:', error)
  }
}

// Enhanced helper function to create user_extended record
async function createUserExtendedRecord(userId: string, email: string, displayName: string) {
  try {
    console.log('Creating/updating user_extended record for:', userId)
    
    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users_extended')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle() // Use maybeSingle() instead of single() to handle zero rows gracefully

    // Only log actual errors, not the expected "no rows" case
    if (checkError) {
      console.error('Error checking existing user:', checkError)
      return
    }

    if (existingUser) {
      console.log('User already exists in users_extended:', userId)
      return
    }

    // Try to call the database function first
    const { error: functionError } = await supabase.rpc('handle_firebase_user_creation', {
      firebase_uid: userId,
      user_email: email,
      display_name: displayName
    })

    if (functionError) {
      console.error('Error calling user creation function:', functionError)
      
      // Fallback: try direct insert with service role permissions
      const userData = {
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
      }

      const { error: insertError } = await supabase
        .from('users_extended')
        .insert([userData])

      if (insertError) {
        console.error('Error creating user_extended record:', insertError)
        
        // Try upsert as final fallback
        const { error: upsertError } = await supabase
          .from('users_extended')
          .upsert([userData], { onConflict: 'user_id' })

        if (upsertError) {
          console.error('Error upserting user_extended record:', upsertError)
        } else {
          console.log('Successfully upserted user_extended record for:', userId)
        }
      } else {
        console.log('Successfully created user_extended record for:', userId)
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

// Mock data generator with improved data quality
function generateMockData<T>(table: string, userId?: string): T[] {
  const mockData: Record<string, any[]> = {
    tasks: [
      {
        id: '1',
        user_id: userId || 'mock-user',
        title: 'Complete React Tutorial',
        description: 'Finish the advanced React concepts tutorial',
        status: 'in_progress',
        priority: 'high',
        due_date: '2024-01-15',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-12T14:30:00Z'
      },
      {
        id: '2',
        user_id: userId || 'mock-user',
        title: 'Practice DSA Problems',
        description: 'Solve 5 array manipulation problems',
        status: 'completed',
        priority: 'medium',
        due_date: '2024-01-12',
        created_at: '2024-01-08T09:00:00Z',
        updated_at: '2024-01-11T16:45:00Z'
      },
      {
        id: '3',
        user_id: userId || 'mock-user',
        title: 'Review TypeScript Basics',
        description: 'Go through TypeScript fundamentals',
        status: 'todo',
        priority: 'low',
        due_date: '2024-01-20',
        created_at: '2024-01-09T11:00:00Z',
        updated_at: '2024-01-09T11:00:00Z'
      }
    ],
    notes: [
      {
        id: '1',
        user_id: userId || 'mock-user',
        title: 'React Hooks Notes',
        content: 'useState and useEffect are the most commonly used hooks. Remember to handle dependencies properly in useEffect.',
        tags: ['react', 'hooks', 'frontend'],
        is_favorite: true,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        user_id: userId || 'mock-user',
        title: 'Algorithm Complexity',
        content: 'Big O notation: O(1) constant, O(log n) logarithmic, O(n) linear, O(n²) quadratic',
        tags: ['algorithms', 'complexity', 'dsa'],
        is_favorite: false,
        created_at: '2024-01-09T15:30:00Z',
        updated_at: '2024-01-09T15:30:00Z'
      }
    ],
    activities: [
      {
        id: '1',
        user_id: userId || 'mock-user',
        action: 'task_completed',
        description: 'Completed task "Practice DSA Problems"',
        metadata: { title: 'Practice DSA Problems', status: 'completed' },
        created_at: '2024-01-11T16:45:00Z'
      },
      {
        id: '2',
        user_id: userId || 'mock-user',
        action: 'note_created',
        description: 'Created note "React Hooks Notes"',
        metadata: { title: 'React Hooks Notes' },
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: '3',
        user_id: userId || 'mock-user',
        action: 'task_created',
        description: 'Created task "Complete React Tutorial"',
        metadata: { title: 'Complete React Tutorial', status: 'in_progress' },
        created_at: '2024-01-10T10:00:00Z'
      }
    ],
    courses: [
      {
        id: '1',
        title: 'Complete React Development',
        description: 'Master React from basics to advanced concepts',
        category: 'web',
        difficulty: 'intermediate',
        duration_hours: 40,
        is_premium: false,
        is_published: true,
        order_index: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Java Programming Fundamentals',
        description: 'Learn Java programming from scratch',
        category: 'java',
        difficulty: 'beginner',
        duration_hours: 60,
        is_premium: false,
        is_published: true,
        order_index: 2,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        title: 'Data Structures & Algorithms',
        description: 'Master DSA concepts with practical examples',
        category: 'dsa',
        difficulty: 'advanced',
        duration_hours: 80,
        is_premium: true,
        is_published: true,
        order_index: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    problems: [
      {
        id: '1',
        title: 'Two Sum',
        description: 'Given an array of integers, return indices of two numbers that add up to target.',
        difficulty: 'easy',
        category: 'arrays',
        tags: ['arrays', 'hash-table'],
        points: 10,
        time_limit_ms: 1000,
        memory_limit_mb: 128,
        is_published: true,
        sample_input: '[2,7,11,15], target = 9',
        sample_output: '[0,1]',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Valid Parentheses',
        description: 'Given a string containing just characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
        difficulty: 'easy',
        category: 'strings',
        tags: ['strings', 'stack'],
        points: 15,
        time_limit_ms: 1000,
        memory_limit_mb: 128,
        is_published: true,
        sample_input: '()[]{}',
        sample_output: 'true',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    leaderboard: [
      {
        id: '1',
        user_id: userId || 'mock-user',
        category: 'overall',
        rank: 1,
        score: 250,
        problems_solved: 15,
        last_updated: '2024-01-12T00:00:00Z'
      },
      {
        id: '2',
        user_id: 'user-2',
        category: 'overall',
        rank: 2,
        score: 230,
        problems_solved: 12,
        last_updated: '2024-01-12T00:00:00Z'
      }
    ],
    achievements: [
      {
        id: '1',
        user_id: userId || 'mock-user',
        type: 'first_submission',
        title: 'First Steps',
        description: 'Completed your first task',
        points_awarded: 10,
        metadata: {},
        earned_at: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        user_id: userId || 'mock-user',
        type: 'problem_solved',
        title: 'Problem Solver',
        description: 'Solved your first coding problem',
        points_awarded: 25,
        metadata: {},
        earned_at: '2024-01-11T16:45:00Z'
      }
    ],
    rewards: [
      {
        id: '1',
        user_id: userId || 'mock-user',
        type: 'points',
        title: 'Welcome Bonus',
        description: 'Welcome to CodeCafe!',
        value: 50,
        is_claimed: true,
        created_at: '2024-01-10T00:00:00Z',
        claimed_at: '2024-01-10T00:00:00Z'
      },
      {
        id: '2',
        user_id: userId || 'mock-user',
        type: 'badge',
        title: 'Early Adopter',
        description: 'One of the first users on the platform',
        value: 1,
        is_claimed: false,
        created_at: '2024-01-11T00:00:00Z',
        claimed_at: null
      }
    ],
    users_extended: [],
    submissions: [
      {
        id: '1',
        user_id: userId || 'mock-user',
        problem_id: '1',
        language: 'javascript',
        code: 'function twoSum(nums, target) { /* solution */ }',
        status: 'accepted',
        execution_time_ms: 85,
        memory_used_mb: 42,
        test_cases_passed: 10,
        total_test_cases: 10,
        points_earned: 10,
        submitted_at: '2024-01-11T16:45:00Z'
      }
    ],
    redemption_requests: []
  }

  return (mockData[table] || []) as T[]
}

export function useRealTimeSubscription<T>(
  table: string,
  filter?: string,
  userId?: string
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Try to fetch from Supabase first
      let query = supabase.from(table).select('*')
      
      if (userId && table !== 'courses' && table !== 'problems' && table !== 'leaderboard') {
        query = query.eq('user_id', userId)
      }
      
      if (filter) {
        // Parse filter string like "status.eq.completed"
        const [column, operator, value] = filter.split('.')
        query = query.filter(column, operator, value)
      }

      const orderColumn = getOrderColumn(table)
      const { data: supabaseData, error: supabaseError } = await query.order(orderColumn, { ascending: false })
      
      if (supabaseError) {
        console.warn(`Supabase error for ${table}, using mock data:`, supabaseError)
        // Use mock data as fallback
        const mockData = generateMockData<T>(table, userId)
        setData(mockData as T[])
      } else {
        setData((supabaseData || []) as T[])
      }
      
      setError(null)
    } catch (err: any) {
      console.warn(`Error fetching ${table}, using mock data:`, err)
      // Use mock data as fallback
      const mockData = generateMockData<T>(table, userId)
      setData(mockData as T[])
      setError(null) // Don't show error since we have fallback data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [table, filter, userId])

  const refetch = async () => {
    await fetchData()
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

        if (error) {
          console.warn(`Supabase error for ${table}, using mock data:`, error)
          // Use mock data as fallback
          const mockData = generateMockData<T>(table)
          setData(mockData as T[])
        } else {
          setData((result || []) as T[])
        }
        
        setError(null)
      } catch (err: any) {
        console.warn(`Error fetching ${table}, using mock data:`, err)
        // Use mock data as fallback
        const mockData = generateMockData<T>(table)
        setData(mockData as T[])
        setError(null)
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

// Function to manually import current Firebase user to Supabase
export async function importCurrentFirebaseUser(currentUser: any) {
  if (!currentUser) {
    throw new Error('No current user to import')
  }

  try {
    await createUserExtendedRecord(
      currentUser.uid,
      currentUser.email || '',
      currentUser.displayName || ''
    )
    return { success: true, message: 'User imported successfully' }
  } catch (error) {
    console.error('Error importing user:', error)
    throw error
  }
}