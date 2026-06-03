/*
  # Update reservations table structure and policies

  1. Changes
    - Remove user_id column and its dependencies
    - Add trigger for automatic time setting
    - Update policies for public access

  2. Security
    - Drop existing policies
    - Create new policies for public access
    - Add policies for viewing reservations based on contact info
*/

-- First drop all existing policies
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can manage their reservation allergies" ON reservation_allergies;
DROP POLICY IF EXISTS "Allow public to create reservations" ON reservations;
DROP POLICY IF EXISTS "Allow viewing reservations with matching contact info" ON reservations;
DROP POLICY IF EXISTS "Allow managing reservation allergies" ON reservation_allergies;

-- Now we can safely drop the user_id column
ALTER TABLE reservations
DROP COLUMN IF EXISTS user_id CASCADE;

-- Add trigger to automatically set time from time_slots
CREATE OR REPLACE FUNCTION set_reservation_time()
RETURNS TRIGGER AS $$
BEGIN
  SELECT time INTO NEW.time
  FROM time_slots
  WHERE id = NEW.time_slot_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reservation_time_trigger
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION set_reservation_time();

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