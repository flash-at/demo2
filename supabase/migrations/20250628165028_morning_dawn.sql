/*
  # Add missing INSERT policies for analytics and user_progress tables

  1. Security Updates
    - Add INSERT policy for `analytics` table to allow authenticated users to insert their own data
    - Add INSERT policy for `user_progress` table to allow authenticated users to insert their own progress data

  2. Changes
    - `analytics` table: Add policy "Users can insert own analytics" for INSERT operations
    - `user_progress` table: Add policy "Users can insert own progress" for INSERT operations

  Both policies ensure users can only insert data associated with their own user ID.
*/

-- Add INSERT policy for analytics table
CREATE POLICY "Users can insert own analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Add INSERT policy for user_progress table  
CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));