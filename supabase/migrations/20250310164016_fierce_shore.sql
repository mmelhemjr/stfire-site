/*
  # Update Reservation System Schema

  1. New Tables
    - `time_slots`
      - `id` (uuid, primary key)
      - `venue_id` (uuid, foreign key)
      - `time` (time)
      - `max_capacity` (integer)
    
    - `allergies`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)

    - `reservation_allergies`
      - `reservation_id` (uuid, foreign key)
      - `allergy_id` (uuid, foreign key)

  2. Changes
    - Add available_seats to venues table
    - Add time_slot_id to reservations table

  3. Security
    - Enable RLS on new tables
    - Add policies for public read access
*/

-- Create time_slots table
CREATE TABLE time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) NOT NULL,
  time time NOT NULL,
  max_capacity integer NOT NULL,
  UNIQUE(venue_id, time)
);

-- Create allergies table
CREATE TABLE allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text
);

-- Create reservation_allergies table
CREATE TABLE reservation_allergies (
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  allergy_id uuid REFERENCES allergies(id) ON DELETE CASCADE,
  PRIMARY KEY (reservation_id, allergy_id)
);

-- Add time_slot_id to reservations
ALTER TABLE reservations ADD COLUMN time_slot_id uuid REFERENCES time_slots(id);

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_allergies ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow public read access to time_slots"
  ON time_slots FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to allergies"
  ON allergies FOR SELECT TO public USING (true);

CREATE POLICY "Users can manage their reservation allergies"
  ON reservation_allergies
  USING (EXISTS (
    SELECT 1 FROM reservations 
    WHERE reservations.id = reservation_allergies.reservation_id 
    AND reservations.user_id = auth.uid()
  ));

-- Insert common allergies
INSERT INTO allergies (name, description) VALUES
  ('Peanuts', 'All peanut-based products'),
  ('Tree Nuts', 'Almonds, walnuts, cashews, etc.'),
  ('Milk', 'Dairy products and lactose'),
  ('Eggs', 'All egg-based products'),
  ('Fish', 'All fish and fish products'),
  ('Shellfish', 'Shrimp, crab, lobster, etc.'),
  ('Soy', 'Soybeans and soy-based products'),
  ('Wheat', 'Gluten and wheat-based products'),
  ('Sesame', 'Sesame seeds and oils');

-- Generate time slots for venues
DO $$
DECLARE
  venue_rec RECORD;
  curr_time TIME;
BEGIN
  FOR venue_rec IN SELECT * FROM venues LOOP
    curr_time := venue_rec.opening_time;
    WHILE curr_time < venue_rec.closing_time LOOP
      INSERT INTO time_slots (venue_id, time, max_capacity)
      VALUES (venue_rec.id, curr_time, venue_rec.capacity);
      curr_time := curr_time + interval '30 minutes';
    END LOOP;
  END LOOP;
END $$;