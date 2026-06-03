/*
  # Create time slots for venues

  1. Changes
    - Create time slots for beach club (9:00 AM to 12:30 PM, 30-minute intervals)
    - Create time slots for restaurant (6:00 PM to 11:00 PM, hourly intervals)
    - Create time slots for bar (9:00 PM to 1:00 AM, hourly intervals)

  2. Security
    - Maintain existing RLS policies
*/

-- Create time slots for beach club
DO $$ 
DECLARE
  beach_club_id uuid;
  current_time time;
BEGIN
  -- Get beach club venue ID
  SELECT id INTO beach_club_id FROM venues WHERE name ILIKE '%beach%' LIMIT 1;
  
  IF beach_club_id IS NOT NULL THEN
    -- Create time slots from 9:00 AM to 12:30 PM in 30-minute increments
    FOR current_time IN 
      SELECT '09:00:00'::time + (INTERVAL '30 minutes' * generate_series(0, 7))
    LOOP
      INSERT INTO time_slots (venue_id, time, max_capacity)
      VALUES (beach_club_id, current_time, 75)
      ON CONFLICT (venue_id, time) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Create time slots for restaurant
DO $$ 
DECLARE
  restaurant_id uuid;
  current_time time;
BEGIN
  -- Get restaurant venue ID
  SELECT id INTO restaurant_id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1;
  
  IF restaurant_id IS NOT NULL THEN
    -- Create time slots from 6:00 PM to 11:00 PM in 1-hour increments
    FOR current_time IN 
      SELECT '18:00:00'::time + (INTERVAL '1 hour' * generate_series(0, 5))
    LOOP
      INSERT INTO time_slots (venue_id, time, max_capacity)
      VALUES (restaurant_id, current_time, 150)
      ON CONFLICT (venue_id, time) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Create time slots for bar
DO $$ 
DECLARE
  bar_id uuid;
  current_time time;
BEGIN
  -- Get bar venue ID
  SELECT id INTO bar_id FROM venues WHERE name ILIKE '%bar%' LIMIT 1;
  
  IF bar_id IS NOT NULL THEN
    -- Create time slots from 9:00 PM to 1:00 AM in 1-hour increments
    FOR current_time IN 
      SELECT '21:00:00'::time + (INTERVAL '1 hour' * generate_series(0, 4))
    LOOP
      INSERT INTO time_slots (venue_id, time, max_capacity)
      VALUES (bar_id, current_time, 100)
      ON CONFLICT (venue_id, time) DO NOTHING;
    END LOOP;
  END IF;
END $$;