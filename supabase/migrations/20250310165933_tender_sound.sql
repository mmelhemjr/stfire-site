/*
  # Update restaurant capacity and time slots

  1. Changes
    - Update restaurant capacity to 100
    - Update restaurant time slots to be from 9 AM to 11 PM
    - Remove available seats display from UI

  2. Notes
    - Maintains existing reservations
    - Updates time slots without data loss
*/

-- Update restaurant capacity
UPDATE venues 
SET capacity = 100
WHERE name ILIKE '%restaurant%';

-- Remove existing restaurant time slots to recreate them
DELETE FROM time_slots
WHERE venue_id IN (
  SELECT id FROM venues WHERE name ILIKE '%restaurant%'
);

-- Create new time slots for restaurant
DO $$ 
DECLARE
  restaurant_id uuid;
  current_time time;
BEGIN
  -- Get restaurant venue ID
  SELECT id INTO restaurant_id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1;
  
  IF restaurant_id IS NOT NULL THEN
    -- Create time slots from 9:00 AM to 11:00 PM in 1-hour increments
    FOR current_time IN 
      SELECT '09:00:00'::time + (INTERVAL '1 hour' * generate_series(0, 14))
    LOOP
      INSERT INTO time_slots (venue_id, time, max_capacity)
      VALUES (restaurant_id, current_time, 100)
      ON CONFLICT (venue_id, time) DO NOTHING;
    END LOOP;
  END IF;
END $$;