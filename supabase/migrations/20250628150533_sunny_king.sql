-- Create a more robust user creation function that handles Firebase authentication
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
  -- Insert or update user_extended record with better error handling
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
    last_activity_date = CURRENT_DATE,
    username = COALESCE(EXCLUDED.username, users_extended.username);
    
  -- Log the user creation/update
  RAISE NOTICE 'User % created/updated successfully', firebase_uid;
END;
$$;

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.handle_firebase_user_creation(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_firebase_user_creation(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_firebase_user_creation(text, text, text) TO anon;

-- Create a function to import Firebase users manually (for admin use)
CREATE OR REPLACE FUNCTION public.import_firebase_user(
  firebase_uid text,
  user_email text DEFAULT NULL,
  display_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Call the main user creation function
  PERFORM public.handle_firebase_user_creation(firebase_uid, COALESCE(user_email, ''), display_name);
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'message', 'User imported successfully',
    'user_id', firebase_uid
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'message', SQLERRM,
      'user_id', firebase_uid
    );
    RETURN result;
END;
$$;

-- Grant permissions for the import function
GRANT EXECUTE ON FUNCTION public.import_firebase_user(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.import_firebase_user(text, text, text) TO service_role;

-- Update the users_extended policies to be more permissive for initial user creation
DROP POLICY IF EXISTS "Allow initial user creation" ON public.users_extended;

-- Create a more permissive policy for user creation
CREATE POLICY "Allow user creation and self-management"
  ON public.users_extended
  FOR ALL
  TO authenticated
  USING (
    -- Users can access their own records
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
    -- Admins can access all records
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
      )
    )
    -- Special admin email
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  )
  WITH CHECK (
    -- Users can create/update their own records
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)
    -- Admins can create/update any records
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE (
        au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
        OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
      )
    )
    -- Special admin email
    OR ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'maheshch1094@gmail.com'
  );

-- Create a trigger to automatically create user_extended records when needed
CREATE OR REPLACE FUNCTION public.auto_create_user_extended()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be used for automatic user creation if needed
  RETURN NEW;
END;
$$;

-- Create a function to check if a user exists and create if not
CREATE OR REPLACE FUNCTION public.ensure_user_exists(firebase_uid text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM public.users_extended 
    WHERE user_id = firebase_uid
  ) INTO user_exists;
  
  -- If user doesn't exist, create them
  IF NOT user_exists THEN
    PERFORM public.handle_firebase_user_creation(firebase_uid, '', '');
  END IF;
  
  RETURN true;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.ensure_user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_exists(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_user_exists(text) TO anon;

-- Insert a sample admin user if it doesn't exist
INSERT INTO public.admin_users (user_id, role, permissions, created_at)
VALUES ('maheshch1094@gmail.com', 'super_admin', '{}', now())
ON CONFLICT (user_id) DO NOTHING;

-- Also create the user_extended record for the admin
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
  'maheshch1094@gmail.com',
  'Admin User',
  10,
  5000,
  2500,
  30,
  CURRENT_DATE,
  'java',
  true,
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  updated_at = now(),
  last_activity_date = CURRENT_DATE;