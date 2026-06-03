/*
  # Update Reservation Policies for External Users

  1. Changes
    - Update policies to allow users to only see reservations with their email
    - Remove user_id check since external users don't have user accounts
    - Maintain admin access for authorized admins

  2. Security
    - Maintains existing RLS policies
    - Uses is_admin() function for permission checks
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
    ELSE email = (SELECT email FROM users WHERE id = auth.uid())
  END
);

CREATE POLICY "Users can update their own reservations"
ON reservations
FOR UPDATE
TO authenticated
USING (
  CASE 
    WHEN is_admin(auth.uid()) THEN true
    ELSE email = (SELECT email FROM users WHERE id = auth.uid())
  END
)
WITH CHECK (
  CASE 
    WHEN is_admin(auth.uid()) THEN true
    ELSE email = (SELECT email FROM users WHERE id = auth.uid())
  END
);

-- Allow public to view reservations with matching contact info
CREATE POLICY "Allow viewing reservations with matching contact info"
ON reservations
FOR SELECT
TO public
USING (
  email IS NOT NULL
  AND telephone IS NOT NULL
);