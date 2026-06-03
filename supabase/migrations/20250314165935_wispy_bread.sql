/*
  # Add RLS Policies for Reservation Tables

  1. Changes
    - Add RLS policies for reservation_tables table
    - Allow admins to manage all reservation tables
    - Allow authenticated users to view reservation tables
    - Allow public to view reservation tables for their reservations

  2. Security
    - Maintain existing RLS
    - Add proper admin checks
    - Ensure data access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to reservation_tables" ON reservation_tables;

-- Create new policies
CREATE POLICY "Allow admins to manage reservation tables"
ON reservation_tables
FOR ALL
TO authenticated
USING (
  is_admin(auth.uid())
)
WITH CHECK (
  is_admin(auth.uid())
);

CREATE POLICY "Allow authenticated users to view reservation tables"
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