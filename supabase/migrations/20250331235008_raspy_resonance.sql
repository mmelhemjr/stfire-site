/*
  # Update Beach Club Time Slots

  1. Changes
    - Set beach club time slots to 9:00 AM - 11:30 AM
    - Allow only one seating per table per day
    - Update max seating duration
    - Handle existing reservations safely

  2. Security
    - Maintain existing RLS policies
*/

-- First, update the beach club area settings
UPDATE areas 
SET 
  opening_time = '09:00',
  closing_time = '11:30',
  max_seating_duration = interval '1 day'  -- Set to full day to enforce single seating
WHERE name = 'Beach Club';

-- Create temporary tables
CREATE TEMP TABLE old_slots (
  id uuid,
  time time
);

CREATE TEMP TABLE new_slots (
  id uuid,
  time time
);

-- Store existing time slots that we want to keep
INSERT INTO old_slots
SELECT ts.id, ts.time
FROM time_slots ts
JOIN areas a ON a.id = ts.area_id
WHERE a.name = 'Beach Club'
AND ts.time IN ('09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00');

-- Insert new time slots
WITH venue AS (
  SELECT id FROM venues WHERE name = 'Saint Fire' LIMIT 1
),
beach_club AS (
  SELECT id, capacity FROM areas WHERE name = 'Beach Club' LIMIT 1
),
inserted_slots AS (
  INSERT INTO time_slots (venue_id, area_id, time, max_capacity)
  SELECT 
    venue.id,
    beach_club.id,
    time_slot,
    beach_club.capacity
  FROM 
    venue,
    beach_club,
    unnest(ARRAY[
      '09:00:00'::time,
      '09:30:00'::time,
      '10:00:00'::time,
      '10:30:00'::time,
      '11:00:00'::time,
      '11:30:00'::time
    ]) AS time_slot
  WHERE NOT EXISTS (
    SELECT 1 FROM old_slots os WHERE os.time = time_slot
  )
  RETURNING id, time
)
INSERT INTO new_slots
SELECT id, time FROM inserted_slots;

-- Update existing reservations to use new time slots where needed
UPDATE reservations r
SET time_slot_id = ns.id
FROM new_slots ns
WHERE r.area_id = (SELECT id FROM areas WHERE name = 'Beach Club')
AND r.time = ns.time
AND r.time_slot_id NOT IN (SELECT id FROM old_slots);

-- Delete old time slots that aren't in our keep list
DELETE FROM time_slots ts
WHERE ts.area_id = (SELECT id FROM areas WHERE name = 'Beach Club')
AND ts.id NOT IN (SELECT id FROM old_slots)
AND ts.id NOT IN (SELECT id FROM new_slots);

-- Drop temporary tables
DROP TABLE old_slots;
DROP TABLE new_slots;

-- Update the check_table_availability function to handle beach club's special case
CREATE OR REPLACE FUNCTION check_table_availability(
  p_area_id uuid,
  p_date date,
  p_time time,
  p_party_size integer
)
RETURNS boolean AS $$
DECLARE
  v_area_name text;
  v_existing_reservations integer;
BEGIN
  -- Get area name
  SELECT name INTO v_area_name
  FROM areas
  WHERE id = p_area_id;

  -- Special handling for Beach Club
  IF v_area_name = 'Beach Club' THEN
    -- Check if there are any reservations for this table on this date
    SELECT COUNT(*)
    INTO v_existing_reservations
    FROM reservations
    WHERE 
      area_id = p_area_id
      AND date = p_date
      AND status = 'confirmed';

    -- For Beach Club, check total capacity for the entire day
    RETURN (
      SELECT capacity >= p_party_size + COALESCE(v_existing_reservations, 0)
      FROM areas
      WHERE id = p_area_id
    );
  END IF;

  -- For other areas, use the existing table availability logic
  RETURN can_seat_party(p_area_id, p_date, p_time, p_party_size);
END;
$$ LANGUAGE plpgsql;