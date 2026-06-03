/*
  # Add quantity column to venue_tables

  1. Changes
    - Add quantity column to venue_tables table
    - Set default value to 1
    - Update existing rows
*/

-- Add quantity column
ALTER TABLE venue_tables
ADD COLUMN quantity integer DEFAULT 1;

-- Update existing rows to have quantity = 1
UPDATE venue_tables
SET quantity = 1;

-- Make quantity required
ALTER TABLE venue_tables
ALTER COLUMN quantity SET NOT NULL;