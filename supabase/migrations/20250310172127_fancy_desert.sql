/*
  # Update reservations table policies

  1. Changes
    - Remove authentication requirement for reservations
    - Add policy for public inserts
    - Keep existing policies for authenticated users

  2. Security
    - Allow public to create reservations without authentication
    - Maintain existing RLS policies for authenticated users
*/

-- Drop the existing insert policy that requires authentication
DROP POLICY IF EXISTS "Users can create their own reservations" ON reservations;

-- Create new policy that allows public inserts
CREATE POLICY "Allow public to create reservations"
ON reservations
FOR INSERT
TO public
WITH CHECK (true);