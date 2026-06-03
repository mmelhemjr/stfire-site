/*
  # Update Beach Club Settings

  1. Changes
    - Set beach club capacity to 75 umbrella sets (2 chairs each)
    - Create time slots for beach club from 9:00 AM to 12:30 PM in 30-minute increments

  2. Details
    - Updates beach club venue capacity to 75 (representing umbrella sets)
    - Creates time slots at 30-minute intervals
    - Each time slot has capacity for 75 sets
*/

-- Update beach club capacity
UPDATE venues 
SET capacity = 75
WHERE name ILIKE '%beach%';

-- Delete existing time slots for beach club
DELETE FROM time_slots 
WHERE venue_id IN (SELECT id FROM venues WHERE name ILIKE '%beach%');

-- Insert new time slots
INSERT INTO time_slots (venue_id, time, max_capacity)
SELECT 
  v.id,
  t.slot_time,
  75
FROM venues v,
  (VALUES 
    ('09:00:00'::time),
    ('09:30:00'::time),
    ('10:00:00'::time),
    ('10:30:00'::time),
    ('11:00:00'::time),
    ('11:30:00'::time),
    ('12:00:00'::time),
    ('12:30:00'::time)
  ) AS t(slot_time)
WHERE v.name ILIKE '%beach%';