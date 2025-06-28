/*
  # Comprehensive RLS Policy Updates

  1. RLS Enablement
     - Enable RLS on all tables
     - Create admin user check function

  2. Analytics Policies
     - Update analytics table policies with proper user checks

  3. User Progress Policies
     - Update user_progress table policies with proper user checks

  4. Course Management
     - Add comprehensive course and lesson policies
     - Support both authenticated and admin access

  5. Reward Management
     - Add policies for rewards management
     - Support user and admin operations

  6. Activities Policies
     - Add insert policy for activities
*/

-- Make sure RLS is enabled on all tables
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_admin_user'
  ) THEN
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
  ELSE
    -- Update the function if it exists
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
  END IF;
END $$;

-- Fix analytics table RLS policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics;
  
  -- Only create "Users can view own analytics" if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analytics' 
    AND policyname = 'Users can view own analytics'
  ) THEN
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
  END IF;
  
  -- Create insert policy
  CREATE POLICY "Users can insert own analytics"
    ON analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
      OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
      OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
    );
END $$;

-- Fix user_progress table RLS policies  
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
  
  -- Only create other policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress' 
    AND policyname = 'Users can update own progress'
  ) THEN
    CREATE POLICY "Users can update own progress"
      ON user_progress
      FOR UPDATE
      TO authenticated
      USING (
        user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
        OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
        OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress' 
    AND policyname = 'Users can view own progress'
  ) THEN
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
  END IF;
  
  -- Create insert policy
  CREATE POLICY "Users can insert own progress"
    ON user_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
      OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
      OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
    );
END $$;

-- Course management policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
  DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
  
  -- Create comprehensive course policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Anyone can view published courses'
  ) THEN
    CREATE POLICY "Anyone can view published courses"
      ON courses
      FOR SELECT
      TO authenticated
      USING (is_published = true OR is_admin_user());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Admins can manage courses'
  ) THEN
    CREATE POLICY "Admins can manage courses"
      ON courses
      FOR ALL
      TO authenticated
      USING (is_admin_user())
      WITH CHECK (is_admin_user());
  END IF;
END $$;

-- Lesson management policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can view published lessons" ON lessons;
  DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
  
  -- Create comprehensive lesson policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lessons' 
    AND policyname = 'Anyone can view published lessons'
  ) THEN
    CREATE POLICY "Anyone can view published lessons"
      ON lessons
      FOR SELECT
      TO authenticated
      USING (is_published = true OR is_admin_user());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lessons' 
    AND policyname = 'Admins can manage lessons'
  ) THEN
    CREATE POLICY "Admins can manage lessons"
      ON lessons
      FOR ALL
      TO authenticated
      USING (is_admin_user())
      WITH CHECK (is_admin_user());
  END IF;
END $$;

-- Reward management policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own rewards" ON rewards;
  DROP POLICY IF EXISTS "Users can update own rewards" ON rewards;
  DROP POLICY IF EXISTS "Admins can manage all rewards" ON rewards;
  DROP POLICY IF EXISTS "Service role can manage rewards" ON rewards;
  
  -- Create comprehensive reward policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rewards' 
    AND policyname = 'Users can view own rewards'
  ) THEN
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
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rewards' 
    AND policyname = 'Users can update own rewards'
  ) THEN
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
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rewards' 
    AND policyname = 'Admins can manage all rewards'
  ) THEN
    CREATE POLICY "Admins can manage all rewards"
      ON rewards
      FOR ALL
      TO authenticated
      USING (is_admin_user())
      WITH CHECK (is_admin_user());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rewards' 
    AND policyname = 'Service role can manage rewards'
  ) THEN
    CREATE POLICY "Service role can manage rewards"
      ON rewards
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Activities policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'activities' 
    AND policyname = 'Users can insert own activities'
  ) THEN
    CREATE POLICY "Users can insert own activities"
      ON activities
      FOR INSERT
      TO authenticated
      WITH CHECK (
        user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
        OR user_id = (current_setting('request.jwt.claims', true)::json->>'email')
        OR user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')
      );
  END IF;
END $$;

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