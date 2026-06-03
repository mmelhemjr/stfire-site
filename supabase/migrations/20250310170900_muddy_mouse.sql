/*
  # Update restaurant time slots

  1. Changes
    - Delete existing restaurant time slots
    - Create new time slots from 9 AM to 11 PM with 30-minute intervals
    - Set maximum capacity to 100 guests per time slot

  2. Security
    - Maintains existing RLS policies
*/

-- First, get the restaurant venue ID
WITH restaurant AS (
  SELECT id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1
)
-- Delete existing time slots for the restaurant
DELETE FROM time_slots 
WHERE venue_id = (SELECT id FROM restaurant);

-- Create new time slots with recursive CTE
WITH RECURSIVE restaurant AS (
  SELECT id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1
),
time_range AS (
  SELECT '09:00'::time as t
  UNION ALL
  SELECT (t + interval '30 minutes')::time
  FROM time_range
  WHERE t < '23:00'::time
)
INSERT INTO time_slots (venue_id, time, max_capacity)
SELECT 
  (SELECT id FROM restaurant),
  t,
  100
FROM time_range
WHERE EXISTS (SELECT 1 FROM restaurant);