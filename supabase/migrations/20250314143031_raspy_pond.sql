/*
  # Restructure Venues into Areas

  1. Changes
    - Create areas table for Main Dining, Bar, and Beach
    - Update existing venue structure
    - Migrate existing data
    - Update related tables and constraints

  2. Security
    - Maintain existing RLS policies
    - Add new policies for areas
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS check_table_availability(uuid, date, time, integer);

-- Create areas table
CREATE TABLE areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity integer NOT NULL,
  opening_time time NOT NULL,
  closing_time time NOT NULL,
  max_seating_duration interval,
  walk_in_percentage integer DEFAULT 20,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on areas
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access to areas
CREATE POLICY "Allow public read access to areas"
  ON areas FOR SELECT TO public USING (true);

-- Insert the three areas
INSERT INTO areas (name, capacity, opening_time, closing_time, max_seating_duration, walk_in_percentage)
VALUES 
  ('Main Dining', 80, '11:00', '23:00', interval '2 hours', 20),
  ('Bar', 40, '16:00', '01:00', interval '3 hours', 30),
  ('Beach Club', 130, '09:00', '19:00', interval '4 hours', 0);

-- Add area_id to venue_tables
ALTER TABLE venue_tables
ADD COLUMN area_id uuid REFERENCES areas(id);

-- Update existing venue_tables with appropriate area_ids
WITH 
main_dining AS (SELECT id FROM areas WHERE name = 'Main Dining' LIMIT 1),
bar AS (SELECT id FROM areas WHERE name = 'Bar' LIMIT 1),
beach AS (SELECT id FROM areas WHERE name = 'Beach Club' LIMIT 1),
restaurant AS (SELECT id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1),
bar_venue AS (SELECT id FROM venues WHERE name ILIKE '%bar%' LIMIT 1),
beach_club AS (SELECT id FROM venues WHERE name ILIKE '%beach%' LIMIT 1)
UPDATE venue_tables vt
SET area_id = 
  CASE 
    WHEN vt.venue_id = (SELECT id FROM restaurant) THEN (SELECT id FROM main_dining)
    WHEN vt.venue_id = (SELECT id FROM bar_venue) THEN (SELECT id FROM bar)
    WHEN vt.venue_id = (SELECT id FROM beach_club) THEN (SELECT id FROM beach)
  END;

-- Make area_id required
ALTER TABLE venue_tables
ALTER COLUMN area_id SET NOT NULL;

-- Add area_id to time_slots
ALTER TABLE time_slots
ADD COLUMN area_id uuid REFERENCES areas(id);

-- Update existing time_slots with appropriate area_ids
WITH 
main_dining AS (SELECT id FROM areas WHERE name = 'Main Dining' LIMIT 1),
bar AS (SELECT id FROM areas WHERE name = 'Bar' LIMIT 1),
beach AS (SELECT id FROM areas WHERE name = 'Beach Club' LIMIT 1),
restaurant AS (SELECT id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1),
bar_venue AS (SELECT id FROM venues WHERE name ILIKE '%bar%' LIMIT 1),
beach_club AS (SELECT id FROM venues WHERE name ILIKE '%beach%' LIMIT 1)
UPDATE time_slots ts
SET area_id = 
  CASE 
    WHEN ts.venue_id = (SELECT id FROM restaurant) THEN (SELECT id FROM main_dining)
    WHEN ts.venue_id = (SELECT id FROM bar_venue) THEN (SELECT id FROM bar)
    WHEN ts.venue_id = (SELECT id FROM beach_club) THEN (SELECT id FROM beach)
  END;

-- Make area_id required
ALTER TABLE time_slots
ALTER COLUMN area_id SET NOT NULL;

-- Add area_id to reservations
ALTER TABLE reservations
ADD COLUMN area_id uuid REFERENCES areas(id);

-- Update existing reservations with appropriate area_ids
WITH 
main_dining AS (SELECT id FROM areas WHERE name = 'Main Dining' LIMIT 1),
bar AS (SELECT id FROM areas WHERE name = 'Bar' LIMIT 1),
beach AS (SELECT id FROM areas WHERE name = 'Beach Club' LIMIT 1),
restaurant AS (SELECT id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1),
bar_venue AS (SELECT id FROM venues WHERE name ILIKE '%bar%' LIMIT 1),
beach_club AS (SELECT id FROM venues WHERE name ILIKE '%beach%' LIMIT 1)
UPDATE reservations r
SET area_id = 
  CASE 
    WHEN r.venue_id = (SELECT id FROM restaurant) THEN (SELECT id FROM main_dining)
    WHEN r.venue_id = (SELECT id FROM bar_venue) THEN (SELECT id FROM bar)
    WHEN r.venue_id = (SELECT id FROM beach_club) THEN (SELECT id FROM beach)
  END;

-- Make area_id required
ALTER TABLE reservations
ALTER COLUMN area_id SET NOT NULL;

-- Create new function with area_id parameter
CREATE OR REPLACE FUNCTION check_table_availability(
  p_area_id uuid,
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
  WHERE vt.area_id = p_area_id
  AND tt.seats >= p_party_size
  AND vt.quantity > (
    SELECT COUNT(*)
    FROM reservations r
    JOIN reservation_tables rt ON rt.reservation_id = r.id
    WHERE r.area_id = p_area_id
    AND r.date = p_date
    AND r.time = p_time
    AND rt.venue_table_id = vt.id
  );

  -- Calculate required tables
  required_tables := 1;

  RETURN available_tables >= required_tables;
END;
$$ LANGUAGE plpgsql;