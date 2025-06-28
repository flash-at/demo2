/*
  # Create user progress table

  1. New Tables
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `course_id` (uuid, foreign key to courses)
      - `lesson_id` (uuid, foreign key to lessons)
      - `is_completed` (boolean)
      - `completion_percentage` (integer)
      - `time_spent_minutes` (integer)
      - `last_accessed` (timestamptz)
      - `completed_at` (timestamptz)
  2. Security
    - Enable RLS on `user_progress` table
    - Add policies for users to manage their own progress
*/

-- Create user_progress table if it doesn't exist
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

-- Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own progress
CREATE POLICY "Users can view own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());