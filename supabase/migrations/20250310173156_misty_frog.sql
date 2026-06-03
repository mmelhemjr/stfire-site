/*
  # Add confirmation number to reservations

  1. Changes
    - Add confirmation_number column to reservations table
    - Set default value using a function that generates a 6-digit number
*/

-- Add confirmation_number column
ALTER TABLE reservations
ADD COLUMN confirmation_number text NOT NULL DEFAULT (
  lpad(floor(random() * 900000 + 100000)::text, 6, '0')
);