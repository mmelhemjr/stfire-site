/*
  # Add Table Assignment Function with Transaction Support

  1. Changes
    - Add function to assign tables with proper locking
    - Handle concurrent access safely
    - Validate table availability within transaction

  2. Security
    - Maintain existing RLS policies
    - Add proper error handling
*/

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
BEGIN
  -- Get reservation details
  SELECT date, time INTO v_reservation_date, v_reservation_time
  FROM reservations
  WHERE id = p_reservation_id
  FOR UPDATE;  -- Lock the reservation row

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;

  -- Check if any of the tables are already assigned
  -- Use FOR UPDATE to lock the rows and prevent concurrent assignments
  FOR v_table_id IN 
    SELECT DISTINCT unnest(p_table_ids)
  LOOP
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
      RAISE EXCEPTION 'Table % is already assigned', v_table_id;
    END IF;
  END LOOP;

  -- Remove any existing table assignments for this reservation
  DELETE FROM reservation_tables
  WHERE reservation_id = p_reservation_id;

  -- Insert new table assignments
  INSERT INTO reservation_tables (reservation_id, venue_table_id)
  SELECT p_reservation_id, unnest(p_table_ids);

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback will happen automatically
    RAISE EXCEPTION 'Failed to assign tables: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION assign_tables_to_reservation(uuid, uuid[]) TO authenticated;