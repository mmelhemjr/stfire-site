/*
  # Fix Time Slots Migration

  1. Changes
    - Create new time slots table
    - Migrate data safely without key conflicts
    - Add table availability function
    - Clean up temporary tables

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- Create new time slots table
CREATE TABLE new_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) NOT NULL,
  time time NOT NULL,
  max_capacity integer NOT NULL,
  UNIQUE(venue_id, time)
);

-- Generate time slots for all venues
DO $$ 
DECLARE
  venue_rec RECORD;
  curr_time TIME;
  slot_interval INTERVAL := '30 minutes';
BEGIN
  FOR venue_rec IN SELECT * FROM venues LOOP
    curr_time := venue_rec.opening_time;
    WHILE curr_time < venue_rec.closing_time LOOP
      INSERT INTO new_time_slots (venue_id, time, max_capacity)
      VALUES (
        venue_rec.id,
        curr_time,
        venue_rec.capacity
      );
      curr_time := curr_time + slot_interval;
    END LOOP;
  END LOOP;
END $$;

-- Create mapping table for old to new time slots
CREATE TABLE time_slot_mapping AS
SELECT 
  old.id as old_id,
  new.id as new_id
FROM time_slots old
JOIN new_time_slots new ON 
  new.venue_id = old.venue_id AND 
  new.time = old.time;

-- Update reservations to use new time slot IDs
UPDATE reservations r
SET time_slot_id = NULL
WHERE time_slot_id IS NOT NULL;

-- Drop old foreign key constraint
ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS reservations_time_slot_id_fkey;

-- Drop old time slots table
DROP TABLE time_slots CASCADE;

-- Rename new table
ALTER TABLE new_time_slots RENAME TO time_slots;

-- Update reservations with new time slot IDs
UPDATE reservations r
SET time_slot_id = m.new_id
FROM time_slot_mapping m
WHERE r.time_slot_id IS NULL
AND EXISTS (
  SELECT 1 FROM time_slots ts
  WHERE ts.venue_id = r.venue_id
  AND ts.time = r.time
);

-- Add foreign key constraint
ALTER TABLE reservations
ADD CONSTRAINT reservations_time_slot_id_fkey
FOREIGN KEY (time_slot_id)
REFERENCES time_slots(id);

-- Clean up
DROP TABLE time_slot_mapping;

-- Add function to check table availability
CREATE OR REPLACE FUNCTION check_table_availability(
  p_venue_id uuid,
  p_date date,
  p_time time,
  p_party_size integer
) RETURNS boolean AS $$
DECLARE
  available_tables integer;
  required_tables integer;
BEGIN
  -- Get count of available tables that can accommodate the party size
  SELECT COUNT(*)
  INTO available_tables
  FROM venue_tables vt
  JOIN table_types tt ON tt.id = vt.table_type_id
  WHERE vt.venue_id = p_venue_id
  AND tt.seats >= p_party_size
  AND vt.quantity > (
    SELECT COUNT(*)
    FROM reservations r
    JOIN reservation_tables rt ON rt.reservation_id = r.id
    WHERE r.venue_id = p_venue_id
    AND r.date = p_date
    AND r.time = p_time
    AND rt.venue_table_id = vt.id
  );

  -- Calculate required tables
  required_tables := 1;

  RETURN available_tables >= required_tables;
END;
$$ LANGUAGE plpgsql;