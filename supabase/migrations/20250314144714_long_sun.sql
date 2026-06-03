/*
  # Update Time Slots for Areas

  1. Changes
    - Drop and recreate time slots for each area
    - Process time slots in smaller batches
    - Preserve existing reservations
    - Update foreign key constraints

  2. Security
    - Maintains existing RLS policies
*/

-- First, store existing reservation time slot mappings
CREATE TEMP TABLE reservation_time_mappings AS
SELECT 
  r.id as reservation_id,
  r.time as reservation_time,
  r.area_id
FROM reservations r
WHERE r.time_slot_id IS NOT NULL;

-- Drop foreign key constraint
ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS reservations_time_slot_id_fkey;

-- Drop existing time slots
TRUNCATE time_slots CASCADE;

-- Drop existing unique constraint
ALTER TABLE time_slots
DROP CONSTRAINT IF EXISTS new_time_slots_venue_id_time_key;

-- Add new unique constraint including area_id
ALTER TABLE time_slots
ADD CONSTRAINT time_slots_venue_area_time_key UNIQUE (venue_id, area_id, time);

-- Function to insert time slots for a specific time range
CREATE OR REPLACE FUNCTION insert_time_slots(
  p_venue_id uuid,
  p_area_id uuid,
  p_start_hour integer,
  p_end_hour integer,
  p_capacity integer
) RETURNS void AS $$
DECLARE
  curr_hour integer;
  curr_minute integer := 0;
BEGIN
  curr_hour := p_start_hour;
  WHILE curr_hour <= p_end_hour LOOP
    WHILE curr_minute < 60 LOOP
      -- Skip if we're at the end hour and it's the 30-minute mark
      EXIT WHEN curr_hour = p_end_hour AND curr_minute > 0;
      
      INSERT INTO time_slots (venue_id, area_id, time, max_capacity)
      VALUES (
        p_venue_id,
        p_area_id,
        (curr_hour || ':' || 
          CASE WHEN curr_minute = 0 THEN '00' ELSE '30' END)::time,
        p_capacity
      );
      
      curr_minute := curr_minute + 30;
    END LOOP;
    curr_hour := curr_hour + 1;
    curr_minute := 0;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create time slots in batches
DO $$ 
DECLARE
  v_venue_id uuid;
  v_main_dining_id uuid;
  v_bar_id uuid;
  v_beach_id uuid;
BEGIN
  -- Get IDs
  SELECT id INTO v_venue_id 
  FROM venues 
  WHERE name ILIKE '%saint%fire%' 
  LIMIT 1;
  
  SELECT id INTO v_main_dining_id 
  FROM areas 
  WHERE name = 'Main Dining' 
  LIMIT 1;
  
  SELECT id INTO v_bar_id 
  FROM areas 
  WHERE name = 'Bar' 
  LIMIT 1;
  
  SELECT id INTO v_beach_id 
  FROM areas 
  WHERE name = 'Beach Club' 
  LIMIT 1;

  -- Main Dining (11:00 - 23:00)
  PERFORM insert_time_slots(v_venue_id, v_main_dining_id, 11, 15, 80);
  PERFORM insert_time_slots(v_venue_id, v_main_dining_id, 16, 19, 80);
  PERFORM insert_time_slots(v_venue_id, v_main_dining_id, 20, 23, 80);

  -- Bar (16:00 - 01:00)
  PERFORM insert_time_slots(v_venue_id, v_bar_id, 16, 19, 40);
  PERFORM insert_time_slots(v_venue_id, v_bar_id, 20, 23, 40);
  
  -- After midnight slots for bar
  INSERT INTO time_slots (venue_id, area_id, time, max_capacity)
  VALUES
    (v_venue_id, v_bar_id, '00:00', 40),
    (v_venue_id, v_bar_id, '00:30', 40),
    (v_venue_id, v_bar_id, '01:00', 40);

  -- Beach Club (09:00 - 19:00)
  PERFORM insert_time_slots(v_venue_id, v_beach_id, 9, 13, 130);
  PERFORM insert_time_slots(v_venue_id, v_beach_id, 14, 19, 130);
END $$;

-- Update reservations with new time slot IDs
UPDATE reservations r
SET time_slot_id = ts.id
FROM reservation_time_mappings rtm
JOIN time_slots ts ON 
  ts.area_id = rtm.area_id AND
  ts.time = rtm.reservation_time
WHERE r.id = rtm.reservation_id;

-- Drop temporary table and function
DROP TABLE reservation_time_mappings;
DROP FUNCTION insert_time_slots(uuid, uuid, integer, integer, integer);

-- Re-enable the foreign key constraint
ALTER TABLE reservations
ADD CONSTRAINT reservations_time_slot_id_fkey
FOREIGN KEY (time_slot_id)
REFERENCES time_slots(id);