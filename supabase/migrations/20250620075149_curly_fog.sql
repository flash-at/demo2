/*
  # Fix Admin Authentication and User Management

  1. Security Updates
    - Fix RLS policies to allow admin operations
    - Ensure proper authentication flow
    - Add comprehensive admin permissions

  2. User Management
    - Create proper user_extended records
    - Add sample users for testing
    - Fix user data display

  3. Reward System
    - Add crypto payment method
    - Update reward types and policies

  4. Admin Operations
    - Allow admins to create/delete all content
    - Fix course, problem, and reward management
*/

-- First, ensure admin_users table has the correct structure
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  created_by text
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin policy
DROP POLICY IF EXISTS "Only admins can access admin_users" ON admin_users;
CREATE POLICY "Only admins can access admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.jwt() ->> 'email'
    OR user_id = auth.jwt() ->> 'sub'
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Insert admin users (both email and potential Firebase UID)
INSERT INTO admin_users (user_id, role, permissions, created_at, created_by)
VALUES 
  ('maheshch1094@gmail.com', 'super_admin', '{"all": true, "courses": true, "problems": true, "users": true, "rewards": true}', now(), 'system'),
  ('admin@codecafe.com', 'admin', '{"courses": true, "problems": true, "users": true, "rewards": true}', now(), 'system'),
  ('superadmin@codecafe.com', 'super_admin', '{"all": true, "courses": true, "problems": true, "users": true, "rewards": true}', now(), 'system')
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;

-- Fix users_extended policies to allow admin access and user creation
DROP POLICY IF EXISTS "Users can view own extended profile" ON users_extended;
DROP POLICY IF EXISTS "Users can update own extended profile" ON users_extended;
DROP POLICY IF EXISTS "Users can insert own extended profile" ON users_extended;

CREATE POLICY "Users can view own extended profile"
  ON users_extended
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR user_id = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own extended profile"
  ON users_extended
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR user_id = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own extended profile"
  ON users_extended
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.jwt() ->> 'sub'
    OR user_id = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Fix courses policies
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;

CREATE POLICY "Admins can manage courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Anyone can view published courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Fix problems policies
DROP POLICY IF EXISTS "Admins can manage problems" ON problems;
DROP POLICY IF EXISTS "Anyone can view published problems" ON problems;

CREATE POLICY "Admins can manage problems"
  ON problems
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Anyone can view published problems"
  ON problems
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Fix rewards policies
DROP POLICY IF EXISTS "Users can view own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can update own rewards" ON rewards;

CREATE POLICY "Users can view own rewards"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR user_id = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own rewards"
  ON rewards
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR user_id = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Admins can manage all rewards"
  ON rewards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Update redemption_requests table to include crypto payment method
ALTER TABLE redemption_requests 
DROP CONSTRAINT IF EXISTS redemption_requests_redemption_type_check;

ALTER TABLE redemption_requests 
ADD CONSTRAINT redemption_requests_redemption_type_check 
CHECK (redemption_type = ANY (ARRAY['cash'::text, 'gift_voucher'::text, 'paypal'::text, 'bank_transfer'::text, 'crypto'::text]));

-- Fix redemption_requests policies
DROP POLICY IF EXISTS "Users can view own redemption requests" ON redemption_requests;
DROP POLICY IF EXISTS "Users can create own redemption requests" ON redemption_requests;
DROP POLICY IF EXISTS "Admins can manage all redemption requests" ON redemption_requests;

CREATE POLICY "Users can view own redemption requests"
  ON redemption_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR user_id = auth.jwt() ->> 'email'
  );

CREATE POLICY "Users can create own redemption requests"
  ON redemption_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.jwt() ->> 'sub'
    OR user_id = auth.jwt() ->> 'email'
  );

CREATE POLICY "Admins can manage all redemption requests"
  ON redemption_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create sample users for testing (these will show up in admin panel)
INSERT INTO users_extended (user_id, username, level, experience_points, total_score, streak_days, last_activity_date, preferred_language, bio, is_premium, created_at, updated_at)
VALUES 
  ('maheshch1094@gmail.com', 'mahesh_admin', 10, 2500, 1250, 15, CURRENT_DATE, 'java', 'Platform Administrator and Full-Stack Developer', true, now() - interval '30 days', now()),
  ('user1@example.com', 'coder_pro', 8, 1800, 900, 12, CURRENT_DATE, 'python', 'Python enthusiast and data science lover', false, now() - interval '25 days', now()),
  ('user2@example.com', 'java_master', 12, 3200, 1600, 20, CURRENT_DATE, 'java', 'Senior Java developer with 5+ years experience', true, now() - interval '45 days', now()),
  ('user3@example.com', 'web_wizard', 6, 1200, 600, 8, CURRENT_DATE, 'web', 'Frontend developer specializing in React', false, now() - interval '15 days', now()),
  ('user4@example.com', 'algo_expert', 15, 4500, 2250, 30, CURRENT_DATE, 'dsa', 'Competitive programming champion', true, now() - interval '60 days', now()),
  ('user5@example.com', 'mobile_dev', 7, 1500, 750, 10, CURRENT_DATE, 'mobile', 'Mobile app developer (iOS & Android)', false, now() - interval '20 days', now()),
  ('user6@example.com', 'db_specialist', 9, 2100, 1050, 14, CURRENT_DATE, 'database', 'Database architect and SQL expert', false, now() - interval '35 days', now()),
  ('user7@example.com', 'newbie_coder', 2, 300, 150, 3, CURRENT_DATE, 'python', 'Just started my coding journey!', false, now() - interval '5 days', now()),
  ('user8@example.com', 'fullstack_dev', 11, 2800, 1400, 18, CURRENT_DATE, 'web', 'Full-stack developer with MERN expertise', true, now() - interval '40 days', now()),
  ('user9@example.com', 'ai_researcher', 13, 3600, 1800, 25, CURRENT_DATE, 'python', 'AI/ML researcher and data scientist', true, now() - interval '50 days', now()),
  ('user10@example.com', 'game_dev', 5, 900, 450, 6, CURRENT_DATE, 'java', 'Indie game developer using Unity', false, now() - interval '12 days', now()),
  ('user11@example.com', 'security_expert', 14, 4000, 2000, 28, CURRENT_DATE, 'java', 'Cybersecurity specialist and ethical hacker', true, now() - interval '55 days', now()),
  ('user12@example.com', 'student_coder', 3, 500, 250, 4, CURRENT_DATE, 'python', 'Computer science student learning to code', false, now() - interval '8 days', now()),
  ('user13@example.com', 'startup_founder', 10, 2600, 1300, 16, CURRENT_DATE, 'web', 'Tech startup founder and entrepreneur', true, now() - interval '42 days', now()),
  ('user14@example.com', 'freelancer_dev', 8, 1900, 950, 11, CURRENT_DATE, 'web', 'Freelance web developer and consultant', false, now() - interval '28 days', now())
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  level = EXCLUDED.level,
  experience_points = EXCLUDED.experience_points,
  total_score = EXCLUDED.total_score,
  streak_days = EXCLUDED.streak_days,
  last_activity_date = EXCLUDED.last_activity_date,
  preferred_language = EXCLUDED.preferred_language,
  bio = EXCLUDED.bio,
  is_premium = EXCLUDED.is_premium,
  updated_at = now();

-- Create some sample courses
INSERT INTO courses (title, description, category, difficulty, duration_hours, is_premium, is_published, order_index, created_by, created_at, updated_at)
VALUES 
  ('Java Fundamentals', 'Learn the basics of Java programming language', 'java', 'beginner', 20, false, true, 1, 'maheshch1094@gmail.com', now(), now()),
  ('Advanced Python', 'Master advanced Python concepts and frameworks', 'python', 'advanced', 35, true, true, 2, 'maheshch1094@gmail.com', now(), now()),
  ('Data Structures & Algorithms', 'Complete guide to DSA with practical examples', 'dsa', 'intermediate', 40, false, true, 3, 'maheshch1094@gmail.com', now(), now()),
  ('React Web Development', 'Build modern web applications with React', 'web', 'intermediate', 30, true, true, 4, 'maheshch1094@gmail.com', now(), now()),
  ('Mobile App Development', 'Create mobile apps for iOS and Android', 'mobile', 'intermediate', 45, true, true, 5, 'maheshch1094@gmail.com', now(), now()),
  ('Database Design', 'Learn database design and SQL optimization', 'database', 'beginner', 25, false, true, 6, 'maheshch1094@gmail.com', now(), now())
ON CONFLICT DO NOTHING;

-- Create some sample problems
INSERT INTO problems (title, description, difficulty, category, tags, points, time_limit_ms, memory_limit_mb, sample_input, sample_output, is_published, created_by, created_at, updated_at)
VALUES 
  ('Two Sum', 'Given an array of integers, return indices of two numbers that add up to target', 'easy', 'arrays', ARRAY['arrays', 'hash-table'], 10, 1000, 128, '[2,7,11,15], target = 9', '[0,1]', true, 'maheshch1094@gmail.com', now(), now()),
  ('Reverse Linked List', 'Reverse a singly linked list', 'easy', 'linked-lists', ARRAY['linked-lists', 'recursion'], 15, 1000, 128, '1->2->3->4->5', '5->4->3->2->1', true, 'maheshch1094@gmail.com', now(), now()),
  ('Binary Tree Inorder', 'Return inorder traversal of binary tree', 'medium', 'trees', ARRAY['trees', 'recursion'], 20, 1500, 128, '[1,null,2,3]', '[1,3,2]', true, 'maheshch1094@gmail.com', now(), now()),
  ('Longest Substring', 'Find length of longest substring without repeating characters', 'medium', 'strings', ARRAY['strings', 'sliding-window'], 25, 2000, 128, '"abcabcbb"', '3', true, 'maheshch1094@gmail.com', now(), now()),
  ('Merge K Sorted Lists', 'Merge k sorted linked lists', 'hard', 'linked-lists', ARRAY['linked-lists', 'divide-conquer'], 35, 3000, 256, '[[1,4,5],[1,3,4],[2,6]]', '[1,1,2,3,4,4,5,6]', true, 'maheshch1094@gmail.com', now(), now())
ON CONFLICT DO NOTHING;

-- Create some sample rewards
INSERT INTO rewards (user_id, type, title, description, value, is_claimed, created_at)
VALUES 
  ('maheshch1094@gmail.com', 'points', 'Admin Bonus', 'Special bonus for platform administration', 500, true, now() - interval '10 days'),
  ('user1@example.com', 'points', 'Welcome Bonus', 'Welcome to CodeCafe! Here are some starter points', 100, false, now() - interval '8 days'),
  ('user2@example.com', 'badge', 'Java Expert', 'Earned for exceptional Java programming skills', 1, true, now() - interval '15 days'),
  ('user4@example.com', 'points', 'Algorithm Master', 'Reward for solving complex algorithms', 250, true, now() - interval '5 days'),
  ('user8@example.com', 'premium_days', 'Premium Trial', 'Free premium access for outstanding performance', 30, false, now() - interval '3 days'),
  ('user9@example.com', 'certificate', 'AI Specialist', 'Certificate for AI/ML expertise', 1, true, now() - interval '7 days')
ON CONFLICT DO NOTHING;

-- Create function to handle new user registration from Firebase
CREATE OR REPLACE FUNCTION handle_firebase_user_creation(
  firebase_uid text,
  user_email text,
  display_name text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert into users_extended if not exists
  INSERT INTO users_extended (
    user_id, 
    username, 
    level, 
    experience_points, 
    total_score, 
    streak_days, 
    last_activity_date, 
    preferred_language, 
    is_premium, 
    created_at, 
    updated_at
  )
  VALUES (
    firebase_uid,
    COALESCE(display_name, 'User' || substring(firebase_uid from 1 for 8)),
    1,
    0,
    0,
    0,
    CURRENT_DATE,
    'java',
    false,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Also create record with email as user_id for compatibility
  INSERT INTO users_extended (
    user_id, 
    username, 
    level, 
    experience_points, 
    total_score, 
    streak_days, 
    last_activity_date, 
    preferred_language, 
    is_premium, 
    created_at, 
    updated_at
  )
  VALUES (
    user_email,
    COALESCE(display_name, 'User' || substring(user_email from 1 for 8)),
    1,
    0,
    0,
    0,
    CURRENT_DATE,
    'java',
    false,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;