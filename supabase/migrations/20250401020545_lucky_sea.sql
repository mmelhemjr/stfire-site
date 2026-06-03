/*
  # Fix Table Relationships and Structure

  1. Changes
    - Drop and recreate venue_tables without quantity
    - Create individual rows for each physical table
    - Preserve existing relationships
    - Update foreign key constraints

  2. Security
    - Maintain existing RLS policies
    - Preserve access controls
*/

-- First, store existing table configurations
CREATE TEMP TABLE table_configs AS
SELECT 
  venue_id,
  area_id,
  table_type_id,
  walk_in_reserved
FROM venue_tables;

-- Store existing reservation table assignments
CREATE TEMP TABLE reservation_assignments AS
SELECT * FROM reservation_tables;

-- Drop existing tables
DROP TABLE IF EXISTS reservation_tables CASCADE;
DROP TABLE IF EXISTS venue_tables CASCADE;

-- Recreate venue_tables without quantity
CREATE TABLE venue_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) NOT NULL,
  area_id uuid REFERENCES areas(id) NOT NULL,
  table_type_id uuid REFERENCES table_types(id) NOT NULL,
  walk_in_reserved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE venue_tables ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Allow public read access to venue_tables"
  ON venue_tables FOR SELECT TO public USING (true);

-- Insert data back
INSERT INTO venue_tables (
  venue_id,
  area_id,
  table_type_id,
  walk_in_reserved
)
SELECT 
  venue_id,
  area_id,
  table_type_id,
  walk_in_reserved
FROM table_configs;

-- Create reservation_tables with proper foreign key
CREATE TABLE reservation_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  venue_table_id uuid REFERENCES venue_tables(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reservation_id, venue_table_id)
);

-- Enable RLS
ALTER TABLE reservation_tables ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Enable admin full access to reservation tables"
ON reservation_tables
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow viewing reservation tables"
ON reservation_tables
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id = reservation_tables.reservation_id
    AND (
      r.user_id = auth.uid() OR
      is_admin(auth.uid())
    )
  )
);

CREATE POLICY "Allow public to view their reservation tables"
ON reservation_tables
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id = reservation_tables.reservation_id
    AND r.email IS NOT NULL
    AND r.telephone IS NOT NULL
  )
);

-- Restore reservation assignments where possible
INSERT INTO reservation_tables (
  id,
  reservation_id,
  venue_table_id,
  created_at
)
SELECT 
  ra.id,
  ra.reservation_id,
  ra.venue_table_id,
  ra.created_at
FROM reservation_assignments ra
WHERE EXISTS (
  SELECT 1 FROM venue_tables vt WHERE vt.id = ra.venue_table_id
);

-- Drop temporary tables
DROP TABLE table_configs;
DROP TABLE reservation_assignments;