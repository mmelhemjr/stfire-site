/*
  # Update Beach Club Time Slots

  1. Changes
    - Set beach club hours to 9:00-11:30 AM only
    - Update time slots for beach club
    - Preserve existing reservations
*/

-- First, update the beach club area settings
UPDATE areas 
SET 
  opening_time = '09:00',
  closing_time = '11:30',
  max_seating_duration = interval '1 day'  -- Set to full day to enforce single seating
WHERE name = 'Beach Club';

-- Store existing time slots that we want to keep
CREATE TEMP TABLE old_slots AS
SELECT ts.id, ts.time
FROM time_slots ts
JOIN areas a ON a.id = ts.area_id
WHERE a.name = 'Beach Club'
AND ts.time IN ('09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00');

-- Delete all beach club time slots outside our desired range
DELETE FROM time_slots ts
WHERE ts.area_id = (SELECT id FROM areas WHERE name = 'Beach Club')
AND ts.time NOT IN ('09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00');

-- Create any missing time slots
WITH venue AS (
  SELECT id FROM venues WHERE name = 'Saint Fire' LIMIT 1
),
beach_club AS (
  SELECT id, capacity FROM areas WHERE name = 'Beach Club' LIMIT 1
)
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
  SELECT 1 
  FROM time_slots ts 
  WHERE ts.area_id = beach_club.id 
  AND ts.time = time_slot
);

-- Drop temporary table
DROP TABLE old_slots;