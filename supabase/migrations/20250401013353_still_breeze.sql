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