-- Migration: add_admin_roles
-- Created at: 1762393232

-- Add role column to user profiles
ALTER TABLE IF EXISTS user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient';

-- Create admin_users table for better role management
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions TEXT[] DEFAULT ARRAY['manage_appointments', 'approve_reviews', 'manage_doctors'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin can read their own record
CREATE POLICY "Admins can view their own record" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage admin_users
CREATE POLICY "Service role can manage admin_users" ON admin_users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for reviews to allow admin approval
CREATE POLICY "Admins can update reviews" ON reviews
  FOR UPDATE USING (is_admin(auth.uid()));

-- Update RLS policies for appointments to allow admin view
CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update appointments" ON appointments
  FOR UPDATE USING (is_admin(auth.uid()));;