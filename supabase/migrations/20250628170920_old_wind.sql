/*
  # Fix RLS Policies and Permissions

  1. Security Updates
    - Enable RLS on all necessary tables
    - Create/update admin helper function
    - Fix analytics table policies
    - Fix user_progress table policies
    - Update course, lesson, reward, and activity policies

  2. Changes
    - Proper user authentication checks using JWT claims
    - Admin access controls
    - Service role permissions
*/

-- Make sure RLS is enabled on all tables
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Create or replace the admin helper function
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate analytics policies
DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics;
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics;

CREATE POLICY "Users can insert own analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
  );

CREATE POLICY "Users can view own analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
    OR is_admin_user()
  );

-- Drop and recreate user_progress policies
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
  );

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
  );

CREATE POLICY "Users can view own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
    OR is_admin_user()
  );

-- Drop and recreate course policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
DROP POLICY IF EXISTS "Service role can manage courses" ON courses;

CREATE POLICY "Anyone can view published courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_published = true OR is_admin_user());

CREATE POLICY "Public can view published courses"
  ON courses
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Admins can manage courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Service role can manage courses"
  ON courses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Drop and recreate lesson policies
DROP POLICY IF EXISTS "Anyone can view published lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;

CREATE POLICY "Anyone can view published lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (is_published = true OR is_admin_user());

CREATE POLICY "Admins can manage lessons"
  ON lessons
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Drop and recreate reward policies
DROP POLICY IF EXISTS "Users can view own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can update own rewards" ON rewards;
DROP POLICY IF EXISTS "Admins can manage all rewards" ON rewards;
DROP POLICY IF EXISTS "Service role can manage rewards" ON rewards;

CREATE POLICY "Users can view own rewards"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
    OR is_admin_user()
  );

CREATE POLICY "Users can update own rewards"
  ON rewards
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
    OR is_admin_user()
  );

CREATE POLICY "Admins can manage all rewards"
  ON rewards
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Service role can manage rewards"
  ON rewards
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Drop and recreate activity policies
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can view own activities" ON activities;

CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
  );

CREATE POLICY "Users can view own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
  );

-- Enable RLS on all public tables
ALTER TABLE users_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;