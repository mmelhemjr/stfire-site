/*
  # Remove Duplicate Menu Items

  1. Changes
    - Creates a temporary table to identify duplicates
    - Keeps the oldest entry for each unique menu item
    - Removes duplicate entries based on category_id and names
    - Preserves data integrity

  2. Security
    - Maintains existing RLS policies
*/

-- Create a temporary table to identify duplicates
CREATE TEMP TABLE menu_item_duplicates AS
WITH ranked_items AS (
  SELECT 
    id,
    category_id,
    name_en,
    name_el,
    name_tr,
    ROW_NUMBER() OVER (
      PARTITION BY category_id, name_en, name_el, name_tr
      ORDER BY created_at ASC
    ) AS row_num
  FROM menu_items
)
SELECT id
FROM ranked_items
WHERE row_num > 1;

-- Delete the duplicates, keeping the oldest entry for each unique item
DELETE FROM menu_items
WHERE id IN (SELECT id FROM menu_item_duplicates);

-- Drop the temporary table
DROP TABLE menu_item_duplicates;