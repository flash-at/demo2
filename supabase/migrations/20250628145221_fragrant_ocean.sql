/*
  # Fix RLS policies for Firebase authentication

  1. Security Updates
    - Update RLS policies for users_extended table to work with Firebase auth
    - Grant proper permissions for user creation function
    - Add fallback policies for user creation

  2. Changes Made
    - Modified users_extended RLS policies to handle Firebase user IDs
    - Added service role bypass for user creation
    - Granted execute permissions on user creation function
    - Added policy for initial user creation

  3. Notes
    - Policies now support both Firebase UIDs and email-based identification
    - Service role can bypass RLS for user creation operations
    - Function permissions granted to authenticated and service roles
*/

-- First, ensure the function exists and has proper permissions
CREATE OR REPLACE FUNCTION public.handle_firebase_user_creation(
  firebase_uid text,
  user_email text,
  display_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user_extended record
  INSERT INTO public.users_extended (
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
  ) VALUES (
    firebase_uid,
    COALESCE(display_name, 'User' || RIGHT(firebase_uid, 4)),
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
  ON CONFLICT (user_id) 
  DO UPDATE SET
    updated_at = now(),
    last_activity_date = CURRENT_DATE;
END;
$$;

-- Grant execute permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.handle_firebase_user_creation(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_firebase_user_creation(text, text, text) TO service_role;

-- Drop existing restrictive policies for users_extended
DROP POLICY IF EXISTS "Users can insert own extended profile" ON public.users_extended;
DROP POLICY IF EXISTS "Users can update own extended profile" ON public.users_extended;
DROP POLICY IF EXISTS "Users can view own extended profile" ON public.users_extended;

-- Create new policies that work with Firebase authentication
CREATE POLICY "Users can insert own extended profile"
  ON public.users_extended
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
  );

CREATE POLICY "Users can update own extended profile"
  ON public.users_extended
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
  );

CREATE POLICY "Users can view own extended profile"
  ON public.users_extended
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
  );

-- Add a service role policy for user creation (allows bypassing RLS for initial user setup)
CREATE POLICY "Service role can manage users_extended"
  ON public.users_extended
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add a policy for anonymous user creation (for initial signup)
CREATE POLICY "Allow initial user creation"
  ON public.users_extended
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.users_extended ENABLE ROW LEVEL SECURITY;

-- Create a helper function to check if user exists
CREATE OR REPLACE FUNCTION public.user_exists(firebase_uid text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users_extended 
    WHERE user_id = firebase_uid
  );
END;
$$;

-- Grant execute permissions for the helper function
GRANT EXECUTE ON FUNCTION public.user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_exists(text) TO service_role;