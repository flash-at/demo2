/*
  # Fix RLS Policies for Analytics and User Progress Tables

  1. Changes
     - Add INSERT policy for analytics table (with existence check)
     - Add INSERT policy for user_progress table (with existence check)
     - Both policies use proper user ID matching from JWT claims
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
      WITH CHECK (
        user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'sub'::text) OR
        user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'email'::text) OR
        user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'user_id'::text)
      );
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
      WITH CHECK (
        user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'sub'::text) OR
        user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'email'::text) OR
        user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'user_id'::text)
      );
  END IF;
END $$;

-- Ensure RLS is enabled on both tables
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;