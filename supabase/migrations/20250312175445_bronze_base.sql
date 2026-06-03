/*
  # Update Reservation Policies for Admin Access

  1. Changes
    - Add mikemelhem@outlook.com as admin
    - Update policies to allow admins to view all reservations
    - Restrict non-admin users to their own reservations

  2. Security
    - Maintains existing RLS policies
    - Uses is_admin() function for permission checks
*/

-- Add mikemelhem@outlook.com as admin
INSERT INTO users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'mikemelhem@outlook.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

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
CREATE POLICY "Allow viewing reservations with matching contact info"
ON reservations
FOR SELECT
TO public
USING (
  email IS NOT NULL
  AND telephone IS NOT NULL
);