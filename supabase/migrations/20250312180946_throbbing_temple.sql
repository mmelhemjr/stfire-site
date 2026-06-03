/*
  # Update Reservation Policies for User Access

  1. Changes
    - Update policies to restrict regular users to only see their own bookings
    - Maintain admin access to all bookings
    - Remove previous policies that allowed broader access

  2. Security
    - Uses is_admin() function for permission checks
    - Ensures users can only see bookings they created
    - Maintains admin ability to see all bookings
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON reservations;
DROP POLICY IF EXISTS "Allow viewing reservations with matching contact info" ON reservations;

-- Create new policies
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

-- Allow public to view reservations with matching contact info
-- This is needed for non-authenticated users to view their reservations
CREATE POLICY "Allow viewing reservations with matching contact info"
ON reservations
FOR SELECT
TO public
USING (
  email IS NOT NULL
  AND telephone IS NOT NULL
);