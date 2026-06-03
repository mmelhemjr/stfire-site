/*
  # Fix user policies to prevent recursion

  1. Changes
    - Drop existing policies
    - Create new policies without recursive checks
    - Add separate admin role check function
    - Update policies to use the new function

  2. Security
    - Maintain same security level with better implementation
    - Prevent infinite recursion
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'admin'
  );
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Create new policies without recursion
CREATE POLICY "Users can read their own data"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  is_admin(auth.uid())
);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update reservation policies to use the new function
DROP POLICY IF EXISTS "Users can read their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON reservations;

CREATE POLICY "Users can read their own reservations"
ON reservations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  is_admin(auth.uid())
);

CREATE POLICY "Users can update their own reservations"
ON reservations
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  is_admin(auth.uid())
);

-- Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;