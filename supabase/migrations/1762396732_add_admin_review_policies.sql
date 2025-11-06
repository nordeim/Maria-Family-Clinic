-- Migration: add_admin_review_policies
-- Created at: 1762396732


-- Add policy for admins to view all reviews
CREATE POLICY "Admins can view all reviews"
ON reviews
FOR SELECT
USING (is_admin(auth.uid()));

-- Add policy for admins to delete reviews (for rejection)
CREATE POLICY "Admins can delete reviews"
ON reviews
FOR DELETE
USING (is_admin(auth.uid()));

-- Also add policy for public to view approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON reviews
FOR SELECT
USING (is_approved = true);
;