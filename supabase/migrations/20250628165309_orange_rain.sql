/*
  # Fix RLS policies for analytics and user_progress tables

  1. Analytics Table
    - Add INSERT policy for authenticated users to insert their own analytics data
    - Ensure users can only insert data for themselves

  2. User Progress Table  
    - Add INSERT policy for authenticated users to insert their own progress data
    - Ensure users can only insert progress for themselves

  3. Security
    - All policies check that user_id matches the authenticated user
    - Prevents users from inserting data for other users
*/

-- Fix analytics table RLS policies
DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics;

CREATE POLICY "Users can insert own analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
  );

-- Fix user_progress table RLS policies  
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
  );

-- Ensure both tables have RLS enabled
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;