import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Database types
export interface Profile {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  website?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface UserExtended {
  id: string
  user_id: string
  username?: string
  level: number
  experience_points: number
  total_score: number
  streak_days: number
  last_activity_date: string
  preferred_language: string
  bio?: string
  github_username?: string
  linkedin_url?: string
  website_url?: string
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  role: 'admin' | 'super_admin' | 'moderator'
  permissions: any
  created_at: string
  created_by?: string
}

export interface Course {
  id: string
  title: string
  description?: string
  category: 'java' | 'python' | 'dsa' | 'web' | 'mobile' | 'database'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_hours: number
  thumbnail_url?: string
  is_premium: boolean
  is_published: boolean
  order_index: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  content?: string
  video_url?: string
  code_examples: any[]
  quiz_questions: any[]
  order_index: number
  duration_minutes: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Problem {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  tags: string[]
  input_format?: string
  output_format?: string
  constraints?: string
  sample_input?: string
  sample_output?: string
  test_cases: any[]
  solution_template: any
  hints: any[]
  points: number
  time_limit_ms: number
  memory_limit_mb: number
  is_published: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  user_id: string
  problem_id: string
  language: string
  code: string
  status: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compile_error'
  execution_time_ms?: number
  memory_used_mb?: number
  test_cases_passed: number
  total_test_cases: number
  points_earned: number
  submitted_at: string
}

export interface Achievement {
  id: string
  user_id: string
  type: 'problem_solved' | 'streak' | 'course_completed' | 'level_up' | 'first_submission' | 'perfect_score'
  title: string
  description?: string
  icon?: string
  points_awarded: number
  metadata: any
  earned_at: string
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  category: 'overall' | 'weekly' | 'monthly' | 'dsa' | 'java' | 'python'
  rank?: number
  score: number
  problems_solved: number
  last_updated: string
}

export interface Reward {
  id: string
  user_id: string
  type: 'points' | 'badge' | 'premium_days' | 'certificate'
  title: string
  description?: string
  value: number
  is_claimed: boolean
  expires_at?: string
  created_at: string
  claimed_at?: string
}

export interface RedemptionRequest {
  id: string
  user_id: string
  redemption_type: 'cash' | 'gift_voucher' | 'paypal' | 'bank_transfer'
  points_used: number
  cash_value: number
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'
  payment_details: any
  admin_notes?: string
  processed_by?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  is_completed: boolean
  completion_percentage: number
  time_spent_minutes: number
  last_accessed: string
  completed_at?: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  tags?: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  action: string
  description: string
  metadata?: any
  created_at: string
}

export interface Analytics {
  id: string
  user_id: string
  metric_name: string
  metric_value: number
  date: string
  created_at: string
}

// Helper function to set up admin session
export const setupAdminSession = async (userEmail: string) => {
  try {
    // Create a custom session for admin operations
    const { data, error } = await supabase.auth.setSession({
      access_token: `admin_${userEmail}`,
      refresh_token: `admin_refresh_${userEmail}`,
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: {
        id: userEmail,
        email: userEmail,
        user_metadata: {
          email: userEmail,
          role: 'admin'
        },
        app_metadata: {
          role: 'admin'
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })
    
    return { data, error }
  } catch (error) {
    console.error('Error setting up admin session:', error)
    return { data: null, error }
  }
}