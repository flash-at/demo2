/*
  # Fix RLS policies for courses table

  1. Security Updates
    - Update RLS policies for courses table to work with Firebase authentication
    - Allow authenticated users to view published courses
    - Allow admins to manage all courses
    - Add service role policies for system operations

  2. Policy Changes
    - Remove restrictive policies that block course access
    - Add flexible policies that work with Firebase JWT claims
    - Ensure proper admin access controls
*/

-- Drop existing restrictive policies for courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Temporary admin bypass" ON public.courses;

-- Create new policies that work with Firebase authentication
CREATE POLICY "Anyone can view published courses"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (
    is_published = true 
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) IN (
      SELECT user_id FROM admin_users
    )
  );

-- Allow admins to manage courses
CREATE POLICY "Admins can manage courses"
  ON public.courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  );

-- Service role policy for system operations
CREATE POLICY "Service role can manage courses"
  ON public.courses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous/public access to published courses for better UX
CREATE POLICY "Public can view published courses"
  ON public.courses
  FOR SELECT
  TO anon
  USING (is_published = true);

-- Ensure RLS is enabled
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Also fix similar issues for other learning tables
-- Fix problems table RLS
DROP POLICY IF EXISTS "Anyone can view published problems" ON public.problems;
DROP POLICY IF EXISTS "Admins can manage problems" ON public.problems;
DROP POLICY IF EXISTS "Temporary admin bypass problems" ON public.problems;

CREATE POLICY "Anyone can view published problems"
  ON public.problems
  FOR SELECT
  TO authenticated
  USING (
    is_published = true 
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  );

CREATE POLICY "Admins can manage problems"
  ON public.problems
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  );

CREATE POLICY "Service role can manage problems"
  ON public.problems
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view published problems"
  ON public.problems
  FOR SELECT
  TO anon
  USING (is_published = true);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Fix leaderboard table RLS
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard;

CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage leaderboard"
  ON public.leaderboard
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view leaderboard"
  ON public.leaderboard
  FOR SELECT
  TO anon
  USING (true);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Fix rewards table RLS
DROP POLICY IF EXISTS "Users can view own rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users can update own rewards" ON public.rewards;
DROP POLICY IF EXISTS "Admins can manage all rewards" ON public.rewards;
DROP POLICY IF EXISTS "Temporary admin bypass rewards" ON public.rewards;

CREATE POLICY "Users can view own rewards"
  ON public.rewards
  FOR SELECT
  TO authenticated
  USING (
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  );

CREATE POLICY "Users can update own rewards"
  ON public.rewards
  FOR UPDATE
  TO authenticated
  USING (
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  );

CREATE POLICY "Admins can manage all rewards"
  ON public.rewards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
      )
    )
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  );

CREATE POLICY "Service role can manage rewards"
  ON public.rewards
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user is admin (helper function)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE (
      au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
      OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
      OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
    )
  ) OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com';
END;
$$;

-- Grant execute permissions for the admin check function
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon;