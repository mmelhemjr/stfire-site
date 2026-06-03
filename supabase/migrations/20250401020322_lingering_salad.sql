/*
  # Fix Table Splitting Logic

  1. Changes
    - Drop quantity column from venue_tables
    - Create individual rows for each physical table
    - Update table assignment function to handle table splitting
    - Ensure proper capacity tracking

  2. Security
    - Maintain existing RLS policies
    - Add proper error handling
*/

-- First, store existing table configurations
CREATE TEMP TABLE table_configs AS
SELECT 
  venue_id,
  area_id,
  table_type_id,
  quantity,
  walk_in_reserved
FROM venue_tables;

-- Drop existing venue_tables and recreate without quantity
DROP TABLE venue_tables CASCADE;

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

-- Insert individual rows for each physical table
WITH RECURSIVE table_expansion AS (
  SELECT 
    venue_id,
    area_id,
    table_type_id,
    quantity,
    walk_in_reserved,
    1 as table_number
  FROM table_configs
  
  UNION ALL
  
  SELECT 
    venue_id,
    area_id,
    table_type_id,
    quantity,
    walk_in_reserved,
    table_number + 1
  FROM table_expansion
  WHERE table_number < quantity
)
INSERT INTO venue_tables (venue_id, area_id, table_type_id, walk_in_reserved)
SELECT 
  venue_id,
  area_id,
  table_type_id,
  table_number <= walk_in_reserved
FROM table_expansion;

-- Drop temporary table
DROP TABLE table_configs;

-- Create function to assign tables to a reservation
CREATE OR REPLACE FUNCTION assign_tables_to_reservation(
  p_reservation_id uuid,
  p_table_ids uuid[]
)
RETURNS void AS $$
DECLARE
  v_reservation_date date;
  v_reservation_time time;
  v_table_id uuid;
  v_assigned_tables uuid[];
BEGIN
  -- Get reservation details
  SELECT date, time INTO v_reservation_date, v_reservation_time
  FROM reservations
  WHERE id = p_reservation_id
  FOR UPDATE;  -- Lock the reservation row

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;

  -- Initialize array to track assigned tables
  v_assigned_tables := ARRAY[]::uuid[];

  -- Remove any existing table assignments for this reservation
  DELETE FROM reservation_tables
  WHERE reservation_id = p_reservation_id;

  -- Check if any of the tables are already assigned
  -- Use FOR UPDATE to lock the rows and prevent concurrent assignments
  FOR v_table_id IN 
    SELECT DISTINCT unnest(p_table_ids)
  LOOP
    -- Check if we've already processed this table in this transaction
    IF v_table_id = ANY(v_assigned_tables) THEN
      RAISE EXCEPTION 'Table % appears multiple times in the assignment list', v_table_id;
    END IF;

    -- Check if the table is already assigned to another reservation
    IF EXISTS (
      SELECT 1
      FROM reservation_tables rt
      JOIN reservations r ON r.id = rt.reservation_id
      WHERE rt.venue_table_id = v_table_id
      AND r.date = v_reservation_date
      AND r.time = v_reservation_time
      AND r.status = 'confirmed'
      AND r.id != p_reservation_id
      FOR UPDATE OF rt
    ) THEN
      RAISE EXCEPTION 'Table % is already assigned to another reservation', v_table_id;
    END IF;

    -- Add table to assigned tables array
    v_assigned_tables := array_append(v_assigned_tables, v_table_id);
  END LOOP;

  -- Insert new table assignments
  INSERT INTO reservation_tables (reservation_id, venue_table_id)
  SELECT 
    p_reservation_id,
    unnest(v_assigned_tables);

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Duplicate table assignment detected';
  WHEN OTHERS THEN
    -- Rollback will happen automatically
    RAISE EXCEPTION 'Failed to assign tables: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION assign_tables_to_reservation(uuid, uuid[]) TO authenticated;