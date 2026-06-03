/*
  # Fix Reservation Tables Policies

  1. Changes
    - Update policies to allow admins to manage reservation tables
    - Add policy for table assignments
    - Maintain security while allowing necessary operations

  2. Security
    - Ensure only admins can manage tables
    - Maintain existing access controls
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow admins to manage reservation tables" ON reservation_tables;
DROP POLICY IF EXISTS "Allow authenticated users to view reservation tables" ON reservation_tables;
DROP POLICY IF EXISTS "Allow public to view their reservation tables" ON reservation_tables;

-- Create new policies
CREATE POLICY "Enable admin full access to reservation tables"
ON reservation_tables
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow viewing reservation tables"
ON reservation_tables
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id = reservation_tables.reservation_id
    AND (
      r.user_id = auth.uid() OR
      is_admin(auth.uid())
    )
  )
);

CREATE POLICY "Allow public to view their reservation tables"
ON reservation_tables
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id = reservation_tables.reservation_id
    AND r.email IS NOT NULL
    AND r.telephone IS NOT NULL
  )
);