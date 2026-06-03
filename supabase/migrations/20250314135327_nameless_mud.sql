/*
  # Update Venue Reservation System - Part 1

  1. Changes
    - Add table management system
    - Update venue configurations
    - Add seating duration tracking
    - Preserve existing time slots

  2. New Tables
    - table_types: Different table configurations
    - venue_tables: Maps tables to venues
    - reservation_tables: Links reservations to tables
*/

-- Create table_types table
CREATE TABLE table_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  seats integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create venue_tables table
CREATE TABLE venue_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) NOT NULL,
  table_type_id uuid REFERENCES table_types(id) NOT NULL,
  quantity integer NOT NULL,
  walk_in_reserved integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create reservation_tables table
CREATE TABLE reservation_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) NOT NULL,
  venue_table_id uuid REFERENCES venue_tables(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reservation_id, venue_table_id)
);

-- Add seating duration to venues
ALTER TABLE venues
ADD COLUMN max_seating_duration interval,
ADD COLUMN walk_in_percentage integer DEFAULT 20;

-- Enable RLS
ALTER TABLE table_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_tables ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow public read access to table_types"
  ON table_types FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to venue_tables"
  ON venue_tables FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to reservation_tables"
  ON reservation_tables FOR SELECT TO public USING (true);

-- Insert table types
INSERT INTO table_types (name, seats) VALUES
  ('Four Top', 4),
  ('Six Top', 6),
  ('Eight Top', 8),
  ('Beach Set', 2);

-- Update beach club configuration
WITH beach_club AS (
  SELECT id FROM venues WHERE name ILIKE '%beach%' LIMIT 1
)
UPDATE venues 
SET 
  capacity = 130,
  opening_time = '09:00',
  closing_time = '11:30',
  max_seating_duration = interval '2 hours 30 minutes',
  walk_in_percentage = 0
WHERE id = (SELECT id FROM beach_club);

-- Configure beach club tables
WITH beach_club AS (
  SELECT id FROM venues WHERE name ILIKE '%beach%' LIMIT 1
),
beach_set AS (
  SELECT id FROM table_types WHERE name = 'Beach Set' LIMIT 1
)
INSERT INTO venue_tables (venue_id, table_type_id, quantity, walk_in_reserved)
SELECT 
  beach_club.id,
  beach_set.id,
  65, -- 65 beach sets
  0  -- No walk-ins for beach club
FROM beach_club, beach_set;

-- Update restaurant configuration
WITH restaurant AS (
  SELECT id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1
)
UPDATE venues 
SET 
  capacity = 100,
  opening_time = '09:00',
  closing_time = '00:00',
  max_seating_duration = interval '3 hours',
  walk_in_percentage = 20
WHERE id = (SELECT id FROM restaurant);

-- Configure restaurant tables
WITH restaurant AS (
  SELECT id FROM venues WHERE name ILIKE '%restaurant%' LIMIT 1
),
table_configs AS (
  SELECT id, name, seats FROM table_types
  WHERE name IN ('Four Top', 'Six Top', 'Eight Top')
)
INSERT INTO venue_tables (venue_id, table_type_id, quantity, walk_in_reserved)
SELECT 
  restaurant.id,
  table_configs.id,
  CASE 
    WHEN table_configs.name = 'Four Top' THEN 8
    WHEN table_configs.name = 'Six Top' THEN 6
    WHEN table_configs.name = 'Eight Top' THEN 2
  END as quantity,
  CASE 
    WHEN table_configs.name = 'Four Top' THEN 2
    WHEN table_configs.name = 'Six Top' THEN 1
    WHEN table_configs.name = 'Eight Top' THEN 0
  END as walk_in_reserved
FROM restaurant, table_configs;

-- Update bar configuration
WITH bar AS (
  SELECT id FROM venues WHERE name ILIKE '%bar%' LIMIT 1
)
UPDATE venues 
SET 
  capacity = 36, -- (3 * 6) + (6 * 4) = 42 total seats
  opening_time = '18:00',
  closing_time = '01:00',
  max_seating_duration = interval '3 hours',
  walk_in_percentage = 20
WHERE id = (SELECT id FROM bar);

-- Configure bar tables
WITH bar AS (
  SELECT id FROM venues WHERE name ILIKE '%bar%' LIMIT 1
),
table_configs AS (
  SELECT id, name, seats FROM table_types
  WHERE name IN ('Four Top', 'Six Top')
)
INSERT INTO venue_tables (venue_id, table_type_id, quantity, walk_in_reserved)
SELECT 
  bar.id,
  table_configs.id,
  CASE 
    WHEN table_configs.name = 'Four Top' THEN 6
    WHEN table_configs.name = 'Six Top' THEN 3
  END as quantity,
  CASE 
    WHEN table_configs.name = 'Four Top' THEN 1
    WHEN table_configs.name = 'Six Top' THEN 1
  END as walk_in_reserved
FROM bar, table_configs;

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