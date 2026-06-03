/*
  # Add customer information fields to reservations

  1. Changes
    - Add first_name column (required)
    - Add last_name column (required)
    - Add email column (required)
    - Add telephone column (required)

  2. Security
    - Maintains existing RLS policies
*/

ALTER TABLE reservations
ADD COLUMN first_name text NOT NULL DEFAULT '',
ADD COLUMN last_name text NOT NULL DEFAULT '',
ADD COLUMN email text NOT NULL DEFAULT '',
ADD COLUMN telephone text NOT NULL DEFAULT '';

-- Remove the default constraints after adding the columns
ALTER TABLE reservations 
ALTER COLUMN first_name DROP DEFAULT,
ALTER COLUMN last_name DROP DEFAULT,
ALTER COLUMN email DROP DEFAULT,
ALTER COLUMN telephone DROP DEFAULT;