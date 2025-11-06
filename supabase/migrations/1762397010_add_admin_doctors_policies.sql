-- Migration: add_admin_doctors_policies
-- Created at: 1762397010


-- Add policy for admins to view all doctors (including inactive)
CREATE POLICY "Admins can view all doctors"
ON doctors
FOR SELECT
USING (is_admin(auth.uid()));

-- Add policy for admins to update doctors
CREATE POLICY "Admins can update doctors"
ON doctors
FOR UPDATE
USING (is_admin(auth.uid()));
;