/*
  # Remove Price Column from Menu Items

  1. Changes
    - Drop price column from menu_items table
    - Remove price-related constraints
    - Preserve all other data
*/

-- Drop the price column from menu_items
ALTER TABLE menu_items DROP COLUMN price;