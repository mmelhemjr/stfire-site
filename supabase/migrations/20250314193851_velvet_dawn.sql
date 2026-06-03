/*
  # Update Venue Tables Configuration

  1. Changes
    - Create single venue if not exists
    - Create areas if not exist
    - Configure tables for each area
    - Set proper capacities and timings
*/

-- First ensure we have a venue
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Saint Fire') THEN
    INSERT INTO venues (name, capacity, opening_time, closing_time)
    VALUES ('Saint Fire', 256, '09:00', '01:00');
  END IF;
END $$;

-- Ensure we have the areas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM areas WHERE name = 'Beach Club') THEN
    INSERT INTO areas (name, capacity, opening_time, closing_time, max_seating_duration, walk_in_percentage)
    VALUES ('Beach Club', 130, '09:00', '19:00', interval '4 hours', 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM areas WHERE name = 'Main Dining') THEN
    INSERT INTO areas (name, capacity, opening_time, closing_time, max_seating_duration, walk_in_percentage)
    VALUES ('Main Dining', 84, '11:00', '23:00', interval '2 hours', 20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM areas WHERE name = 'Bar') THEN
    INSERT INTO areas (name, capacity, opening_time, closing_time, max_seating_duration, walk_in_percentage)
    VALUES ('Bar', 42, '16:00', '01:00', interval '3 hours', 30);
  END IF;
END $$;

-- Ensure we have all table types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM table_types WHERE name = 'Beach Set') THEN
    INSERT INTO table_types (name, seats) VALUES ('Beach Set', 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM table_types WHERE name = 'Four Top') THEN
    INSERT INTO table_types (name, seats) VALUES ('Four Top', 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM table_types WHERE name = 'Six Top') THEN
    INSERT INTO table_types (name, seats) VALUES ('Six Top', 6);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM table_types WHERE name = 'Eight Top') THEN
    INSERT INTO table_types (name, seats) VALUES ('Eight Top', 8);
  END IF;
END $$;

-- Now configure the tables
DO $$ 
DECLARE
  v_venue_id uuid;
  v_beach_area_id uuid;
  v_dining_area_id uuid;
  v_bar_area_id uuid;
  v_beach_set_id uuid;
  v_four_top_id uuid;
  v_six_top_id uuid;
  v_eight_top_id uuid;
BEGIN
  -- Get IDs
  SELECT id INTO v_venue_id FROM venues WHERE name = 'Saint Fire';
  SELECT id INTO v_beach_area_id FROM areas WHERE name = 'Beach Club';
  SELECT id INTO v_dining_area_id FROM areas WHERE name = 'Main Dining';
  SELECT id INTO v_bar_area_id FROM areas WHERE name = 'Bar';
  
  SELECT id INTO v_beach_set_id FROM table_types WHERE name = 'Beach Set';
  SELECT id INTO v_four_top_id FROM table_types WHERE name = 'Four Top';
  SELECT id INTO v_six_top_id FROM table_types WHERE name = 'Six Top';
  SELECT id INTO v_eight_top_id FROM table_types WHERE name = 'Eight Top';

  -- Delete existing reservations and tables
  DELETE FROM reservation_tables;
  DELETE FROM venue_tables;

  -- Beach Club tables (65 beach sets)
  INSERT INTO venue_tables (venue_id, area_id, table_type_id, quantity, walk_in_reserved)
  VALUES (v_venue_id, v_beach_area_id, v_beach_set_id, 65, 0);

  -- Main Dining tables
  INSERT INTO venue_tables (venue_id, area_id, table_type_id, quantity, walk_in_reserved)
  VALUES 
    (v_venue_id, v_dining_area_id, v_four_top_id, 8, 2),  -- 8 four tops
    (v_venue_id, v_dining_area_id, v_six_top_id, 6, 1),   -- 6 six tops
    (v_venue_id, v_dining_area_id, v_eight_top_id, 2, 0); -- 2 eight tops

  -- Bar tables
  INSERT INTO venue_tables (venue_id, area_id, table_type_id, quantity, walk_in_reserved)
  VALUES 
    (v_venue_id, v_bar_area_id, v_four_top_id, 6, 1), -- 6 four tops
    (v_venue_id, v_bar_area_id, v_six_top_id, 3, 1);  -- 3 six tops

END $$;