/*
  # Fix RLS policies for analytics and user_progress tables

  1. Security Updates
    - Add INSERT policy for analytics table if it doesn't exist
    - Add INSERT policy for user_progress table if it doesn't exist
    
  2. Changes
    - Allow authenticated users to insert their own analytics data
    - Allow authenticated users to insert their own progress data
*/

-- Add INSERT policy for analytics table (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analytics' 
    AND policyname = 'Users can insert own analytics'
  ) THEN
    CREATE POLICY "Users can insert own analytics"
      ON analytics
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));
  END IF;
END $$;

-- Add INSERT policy for user_progress table (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress' 
    AND policyname = 'Users can insert own progress'
  ) THEN
    CREATE POLICY "Users can insert own progress"
      ON user_progress
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));
  END IF;
END $$;