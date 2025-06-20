/*
  # Fix Courses RLS Policy for Admin Access

  1. Updates
    - Fix RLS policies for courses table to properly recognize admin users
    - Ensure admin users can create, read, update, and delete courses
    - Allow authenticated users to view published courses

  2. Security
    - Maintain RLS protection
    - Allow admin operations based on admin_users table
    - Preserve public read access for published courses
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;

-- Create updated admin policy that properly checks authentication
CREATE POLICY "Admins can manage courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
      OR au.user_id = (auth.jwt() ->> 'user_metadata')::json ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
      OR au.user_id = (auth.jwt() ->> 'user_metadata')::json ->> 'email'
    )
  );

-- Create policy for viewing published courses
CREATE POLICY "Anyone can view published courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Also update problems table policies to match
DROP POLICY IF EXISTS "Admins can manage problems" ON problems;
DROP POLICY IF EXISTS "Anyone can view published problems" ON problems;

CREATE POLICY "Admins can manage problems"
  ON problems
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
      OR au.user_id = (auth.jwt() ->> 'user_metadata')::json ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = auth.jwt() ->> 'sub'
      OR au.user_id = (auth.jwt() ->> 'user_metadata')::json ->> 'email'
    )
  );

CREATE POLICY "Anyone can view published problems"
  ON problems
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Ensure the admin user exists in admin_users table
INSERT INTO admin_users (user_id, role, permissions, created_at, created_by)
VALUES (
  'maheshch1094@gmail.com',
  'super_admin',
  '{"all": true, "courses": true, "problems": true, "users": true, "rewards": true}',
  now(),
  'system'
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  permissions = '{"all": true, "courses": true, "problems": true, "users": true, "rewards": true}';

-- Also add the Firebase UID if we know it (this would be the actual user ID from Firebase)
-- Note: Replace 'FIREBASE_UID_HERE' with the actual Firebase UID when known
-- INSERT INTO admin_users (user_id, role, permissions, created_at, created_by)
-- VALUES (
--   'FIREBASE_UID_HERE',
--   'super_admin',
--   '{"all": true, "courses": true, "problems": true, "users": true, "rewards": true}',
--   now(),
--   'system'
-- ) ON CONFLICT (user_id) DO NOTHING;