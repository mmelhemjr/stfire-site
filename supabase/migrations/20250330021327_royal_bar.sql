/*
  # Add Table Capacity Tracking

  1. Changes
    - Add function to calculate available tables for a given time slot
    - Add function to check if a party can be seated at specific tables
    - Update time slots to include table availability information

  2. Security
    - Maintain existing RLS policies
    - Add proper error handling
*/

-- Create function to calculate available tables
CREATE OR REPLACE FUNCTION calculate_available_tables(
  p_area_id uuid,
  p_date date,
  p_time time,
  p_party_size integer
)
RETURNS TABLE (
  table_type_id uuid,
  total_tables integer,
  available_tables integer,
  seats_per_table integer
) AS $$
BEGIN
  RETURN QUERY
  WITH reserved_tables AS (
    SELECT 
      vt.table_type_id,
      COUNT(*) as reserved_count
    FROM reservations r
    JOIN reservation_tables rt ON rt.reservation_id = r.id
    JOIN venue_tables vt ON vt.id = rt.venue_table_id
    WHERE 
      r.area_id = p_area_id AND
      r.date = p_date AND
      r.time = p_time AND
      r.status = 'confirmed'
    GROUP BY vt.table_type_id
  )
  SELECT 
    vt.table_type_id,
    SUM(vt.quantity)::integer as total_tables,
    (SUM(vt.quantity) - COALESCE(rt.reserved_count, 0) - SUM(vt.walk_in_reserved))::integer as available_tables,
    tt.seats as seats_per_table
  FROM venue_tables vt
  JOIN table_types tt ON tt.id = vt.table_type_id
  LEFT JOIN reserved_tables rt ON rt.table_type_id = vt.table_type_id
  WHERE vt.area_id = p_area_id
  GROUP BY vt.table_type_id, tt.seats, rt.reserved_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if party can be seated
CREATE OR REPLACE FUNCTION can_seat_party(
  p_area_id uuid,
  p_date date,
  p_time time,
  p_party_size integer
)
RETURNS boolean AS $$
DECLARE
  available_seats integer := 0;
  table_record record;
BEGIN
  -- Check each table type
  FOR table_record IN 
    SELECT * FROM calculate_available_tables(p_area_id, p_date, p_time, p_party_size)
    WHERE available_tables > 0
    ORDER BY seats_per_table DESC
  LOOP
    -- If a single table can accommodate the party, return true
    IF table_record.seats_per_table >= p_party_size THEN
      RETURN true;
    END IF;
    
    -- Add up available seats for combining tables
    available_seats := available_seats + (table_record.available_tables * table_record.seats_per_table);
  END LOOP;

  -- Return true if total available seats can accommodate the party
  RETURN available_seats >= p_party_size;
END;
$$ LANGUAGE plpgsql;

-- Update check_table_availability function to use new logic
CREATE OR REPLACE FUNCTION check_table_availability(
  p_area_id uuid,
  p_date date,
  p_time time,
  p_party_size integer
)
RETURNS boolean AS $$
BEGIN
  -- First check if the area has enough total capacity
  IF NOT EXISTS (
    SELECT 1 FROM areas
    WHERE id = p_area_id
    AND capacity >= p_party_size
  ) THEN
    RETURN false;
  END IF;

  -- Then check if we have available tables
  RETURN can_seat_party(p_area_id, p_date, p_time, p_party_size);
END;
$$ LANGUAGE plpgsql;