/*
  # Learning Platform Schema

  1. New Tables
    - `users_extended` - Extended user profiles with learning data
    - `courses` - Programming courses (Java, Python, DSA, etc.)
    - `lessons` - Individual lessons within courses
    - `problems` - DSA and coding problems
    - `submissions` - User code submissions
    - `achievements` - User achievements and badges
    - `leaderboard` - User rankings and scores
    - `rewards` - Reward system
    - `user_progress` - Track user progress through courses
    - `admin_users` - Admin user management

  2. Security
    - Enable RLS on all tables
    - Add policies for user access and admin access
    - Separate admin and user permissions

  3. Features
    - Comprehensive learning tracking
    - Achievement and reward system
    - Leaderboard functionality
    - Admin management capabilities
*/

-- Extended user profiles
CREATE TABLE IF NOT EXISTS users_extended (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  username text UNIQUE,
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  total_score integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  preferred_language text DEFAULT 'java',
  bio text,
  github_username text,
  linkedin_url text,
  website_url text,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  created_by text
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('java', 'python', 'dsa', 'web', 'mobile', 'database')),
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_hours integer DEFAULT 0,
  thumbnail_url text,
  is_premium boolean DEFAULT false,
  is_published boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  video_url text,
  code_examples jsonb DEFAULT '[]',
  quiz_questions jsonb DEFAULT '[]',
  order_index integer DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Problems table (DSA and coding challenges)
CREATE TABLE IF NOT EXISTS problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  input_format text,
  output_format text,
  constraints text,
  sample_input text,
  sample_output text,
  test_cases jsonb DEFAULT '[]',
  solution_template jsonb DEFAULT '{}',
  hints jsonb DEFAULT '[]',
  points integer DEFAULT 10,
  time_limit_ms integer DEFAULT 1000,
  memory_limit_mb integer DEFAULT 128,
  is_published boolean DEFAULT true,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User submissions
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  language text NOT NULL,
  code text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error')),
  execution_time_ms integer,
  memory_used_mb integer,
  test_cases_passed integer DEFAULT 0,
  total_test_cases integer DEFAULT 0,
  points_earned integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now()
);

-- Achievements and badges
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('problem_solved', 'streak', 'course_completed', 'level_up', 'first_submission', 'perfect_score')),
  title text NOT NULL,
  description text,
  icon text,
  points_awarded integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  earned_at timestamptz DEFAULT now()
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  category text DEFAULT 'overall' CHECK (category IN ('overall', 'weekly', 'monthly', 'dsa', 'java', 'python')),
  rank integer,
  score integer DEFAULT 0,
  problems_solved integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Rewards system
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('points', 'badge', 'premium_days', 'certificate')),
  title text NOT NULL,
  description text,
  value integer DEFAULT 0,
  is_claimed boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  claimed_at timestamptz
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completion_percentage integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE users_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own extended profile"
  ON users_extended FOR SELECT
  TO authenticated
  USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can update own extended profile"
  ON users_extended FOR UPDATE
  TO authenticated
  USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can insert own extended profile"
  ON users_extended FOR INSERT
  TO authenticated
  WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Admin policies
CREATE POLICY "Only admins can access admin_users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

-- Course policies
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

-- Lesson policies
CREATE POLICY "Anyone can view published lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

-- Problem policies
CREATE POLICY "Anyone can view published problems"
  ON problems FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage problems"
  ON problems FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

-- Submission policies
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can insert own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

-- Achievement policies
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "System can insert achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Leaderboard policies
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  TO authenticated
  USING (true);

-- Reward policies
CREATE POLICY "Users can view own rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can update own rewards"
  ON rewards FOR UPDATE
  TO authenticated
  USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can update own progress"
  ON user_progress FOR ALL
  TO authenticated
  USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Insert sample data
INSERT INTO courses (title, description, category, difficulty, duration_hours, is_published) VALUES
('Java Fundamentals', 'Learn the basics of Java programming', 'java', 'beginner', 20, true),
('Python Basics', 'Introduction to Python programming', 'python', 'beginner', 15, true),
('Data Structures & Algorithms', 'Master DSA concepts with practical examples', 'dsa', 'intermediate', 40, true),
('Advanced Java', 'Advanced Java concepts and frameworks', 'java', 'advanced', 30, true),
('Python for Data Science', 'Python libraries for data analysis', 'python', 'intermediate', 25, true);

INSERT INTO problems (title, description, difficulty, category, points, sample_input, sample_output) VALUES
('Two Sum', 'Given an array of integers, return indices of two numbers that add up to target', 'easy', 'arrays', 10, '[2,7,11,15], target = 9', '[0,1]'),
('Reverse String', 'Write a function that reverses a string', 'easy', 'strings', 5, '"hello"', '"olleh"'),
('Binary Search', 'Implement binary search algorithm', 'medium', 'searching', 15, '[1,2,3,4,5], target = 3', '2'),
('Merge Sort', 'Implement merge sort algorithm', 'medium', 'sorting', 20, '[64,34,25,12,22,11,90]', '[11,12,22,25,34,64,90]'),
('Longest Palindrome', 'Find the longest palindromic substring', 'hard', 'strings', 30, '"babad"', '"bab" or "aba"');