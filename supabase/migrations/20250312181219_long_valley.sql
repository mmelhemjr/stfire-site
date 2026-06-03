/*
  # Fix User Booking Policies

  1. Changes
    - Update policies to properly restrict users to their own bookings
    - Ensure user_id is properly checked for regular users
    - Fix policy for mmelhemjr@gmail.com to only see their own bookings

  2. Security
    - Uses is_admin() function for permission checks
    - Ensures strict user_id matching for non-admin users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON reservations;
DROP POLICY IF EXISTS "Allow viewing reservations with matching contact info" ON reservations;

-- Create new policies with strict user_id checking
CREATE POLICY "Users can read their own reservations"
ON reservations
FOR SELECT
TO authenticated
USING (
  CASE 
    WHEN is_admin(auth.uid()) THEN true
    ELSE user_id = auth.uid()
  END
);

CREATE POLICY "Users can update their own reservations"
ON reservations
FOR UPDATE
TO authenticated
USING (
  CASE 
    WHEN is_admin(auth.uid()) THEN true
    ELSE user_id = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_admin(auth.uid()) THEN true
    ELSE user_id = auth.uid()
  END
);

-- Ensure non-authenticated users can only view their reservations by contact info
CREATE POLICY "Allow viewing reservations with matching contact info"
ON reservations
FOR SELECT
TO public
USING (
  (email IS NOT NULL AND telephone IS NOT NULL) AND
  NOT EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role != 'admin'
  )
);

-- Ensure all existing reservations have proper user_id set
DO $$
BEGIN
  -- Update reservations to link to existing users by email
  UPDATE reservations
  SET user_id = users.id
  FROM users
  WHERE reservations.email = users.email
  AND reservations.user_id IS NULL;
END $$;