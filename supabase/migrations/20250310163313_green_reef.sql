/*
  # Reservation System Schema

  1. New Tables
    - `venues`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the venue (Restaurant or Beach Club)
      - `capacity` (integer) - Total capacity
      - `opening_time` (time)
      - `closing_time` (time)
      
    - `reservations`
      - `id` (uuid, primary key)
      - `venue_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `time` (time)
      - `party_size` (integer)
      - `occasion` (text)
      - `dietary_restrictions` (text)
      - `status` (text) - confirmed, cancelled, completed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read and create reservations
    - Add policies for public read access to venues
*/

-- Create venues table
CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity integer NOT NULL,
  opening_time time NOT NULL,
  closing_time time NOT NULL
);

-- Create reservations table
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  party_size integer NOT NULL,
  occasion text,
  dietary_restrictions text,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('confirmed', 'cancelled', 'completed'))
);

-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Venues policies
CREATE POLICY "Allow public read access to venues"
  ON venues
  FOR SELECT
  TO public
  USING (true);

-- Reservations policies
CREATE POLICY "Users can create their own reservations"
  ON reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial venue data
INSERT INTO venues (name, capacity, opening_time, closing_time) VALUES
  ('Saint Fire Restaurant', 100, '19:00', '00:00'),
  ('Saint Fire Beach Club', 75, '09:00', '19:00');