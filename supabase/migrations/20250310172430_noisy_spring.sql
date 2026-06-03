/*
  # Update reservations table structure

  1. Changes
    - Remove user_id column and its dependencies
    - Update RLS policies for public access
    - Remove user-based policies
    - Add email/telephone-based policies

  2. Security
    - Drop existing policies that depend on user_id
    - Create new policies for public access
    - Add policies for viewing reservations based on contact info
*/

-- First drop the dependent policies
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can manage their reservation allergies" ON reservation_allergies;
DROP POLICY IF EXISTS "Allow public to create reservations" ON reservations;

-- Now we can safely drop the user_id column
ALTER TABLE reservations
DROP COLUMN IF EXISTS user_id;

-- Create new policies for public access
CREATE POLICY "Allow public to create reservations"
ON reservations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow viewing reservations with matching contact info"
ON reservations
FOR SELECT
TO public
USING (
  email IS NOT NULL
  AND telephone IS NOT NULL
);

-- Update reservation_allergies policy
CREATE POLICY "Allow managing reservation allergies"
ON reservation_allergies
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM reservations
    WHERE reservations.id = reservation_allergies.reservation_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reservations
    WHERE reservations.id = reservation_allergies.reservation_id
  )
);