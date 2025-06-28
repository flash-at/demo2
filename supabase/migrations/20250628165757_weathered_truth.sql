/*
  # Fix RLS policies for all tables

  1. Security Updates
    - Enable RLS on all necessary tables
    - Create helper function to check admin status
    - Add comprehensive policies for analytics, user_progress, courses, lessons, rewards
    
  2. Policy Management
    - Drop existing conflicting policies first
    - Create new policies with proper user identification
    - Ensure service role has full access
    
  3. Tables Updated
    - analytics: INSERT and SELECT policies
    - user_progress: INSERT, UPDATE, SELECT policies  
    - courses: SELECT and ALL policies for admins
    - lessons: SELECT and ALL policies for admins
    - rewards: SELECT, UPDATE, ALL policies
    - activities: INSERT policy
*/

-- Make sure RLS is enabled on all tables
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix analytics table RLS policies
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

-- Fix user_progress table RLS policies  
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can all own progress" ON user_progress;

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

-- Course management policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
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

-- Lesson management policies
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

-- Reward management policies
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

-- Activities policies
DROP POLICY IF EXISTS "Users can insert activities" ON activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;

CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
    OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
  );

-- Ensure all tables have proper RLS enabled
DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('schema_migrations')
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;