/*
  # Fix RLS Policies and Add Redemption System

  1. Admin User Setup
    - Ensure maheshch1094@gmail.com has super admin access
    - Add system admin user for backend operations

  2. RLS Policy Updates
    - Fix courses table policies to allow admin operations
    - Fix problems table policies to allow admin operations
    - Support both email and user ID based admin authentication

  3. Redemption System
    - Create redemption_requests table for cash/voucher redemptions
    - Add RLS policies for secure access
    - Create triggers for activity logging and timestamp updates
    - Support multiple redemption types: cash, gift vouchers, PayPal, bank transfer

  4. Performance Optimizations
    - Add indexes for better query performance
    - Create proper foreign key relationships
*/

-- First, ensure the admin user exists in admin_users table
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

-- Update courses RLS policies to allow admin operations
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;

CREATE POLICY "Admins can manage courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = (auth.jwt() ->> 'sub')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Anyone can view published courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Update problems RLS policies to allow admin operations
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
      OR au.user_id = (auth.jwt() ->> 'sub')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Anyone can view published problems"
  ON problems
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Add system user for admin operations
INSERT INTO admin_users (user_id, role, permissions, created_at, created_by)
VALUES (
  'system',
  'super_admin',
  '{"all": true}',
  now(),
  'system'
) ON CONFLICT (user_id) DO NOTHING;

-- Create redemption_requests table for cash/voucher redemptions
CREATE TABLE IF NOT EXISTS redemption_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  redemption_type text NOT NULL CHECK (redemption_type IN ('cash', 'gift_voucher', 'paypal', 'bank_transfer')),
  points_used integer NOT NULL CHECK (points_used > 0),
  cash_value decimal(10,2) NOT NULL CHECK (cash_value > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  payment_details jsonb DEFAULT '{}',
  admin_notes text,
  processed_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS on redemption_requests
ALTER TABLE redemption_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for redemption_requests
CREATE POLICY "Users can create own redemption requests"
  ON redemption_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.jwt() ->> 'sub') OR user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can view own redemption requests"
  ON redemption_requests
  FOR SELECT
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub') OR user_id = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage all redemption requests"
  ON redemption_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.jwt() ->> 'email'
      OR au.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_redemption_requests_user_id ON redemption_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_status ON redemption_requests(status);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_created_at ON redemption_requests(created_at);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_redemption_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_redemption_requests_updated_at
  BEFORE UPDATE ON redemption_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_redemption_requests_updated_at();

-- Create function to log redemption activities
CREATE OR REPLACE FUNCTION log_redemption_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (user_id, action, description, metadata, created_at)
    VALUES (
      NEW.user_id,
      'redemption_requested',
      'Requested redemption of ' || NEW.points_used || ' points for $' || NEW.cash_value || ' via ' || NEW.redemption_type,
      jsonb_build_object(
        'redemption_id', NEW.id,
        'points_used', NEW.points_used,
        'cash_value', NEW.cash_value,
        'type', NEW.redemption_type
      ),
      now()
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO activities (user_id, action, description, metadata, created_at)
    VALUES (
      NEW.user_id,
      'redemption_status_changed',
      'Redemption request status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object(
        'redemption_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'processed_by', NEW.processed_by
      ),
      now()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for redemption activities
CREATE TRIGGER redemption_activity_trigger
  AFTER INSERT OR UPDATE ON redemption_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_redemption_activity();