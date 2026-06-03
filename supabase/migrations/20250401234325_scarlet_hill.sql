/*
  # Menu System Schema

  1. New Tables
    - menu_sections: Breakfast, Beach & Snack, Restaurant
    - menu_categories: Groups items within sections
    - menu_items: Individual menu items with translations

  2. Security
    - Enable RLS
    - Add public read access policies
*/

-- Create menu_sections table
CREATE TABLE menu_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  time_range text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create menu_categories table
CREATE TABLE menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES menu_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES menu_categories(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  description_en text,
  name_el text NOT NULL,
  description_el text,
  name_tr text NOT NULL,
  description_tr text,
  price numeric(10,2) NOT NULL,
  tags text[] DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Add policies for public read access
CREATE POLICY "Allow public read access to menu_sections"
  ON menu_sections FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to menu_categories"
  ON menu_categories FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to menu_items"
  ON menu_items FOR SELECT TO public USING (true);

-- Insert initial menu sections
INSERT INTO menu_sections (name, time_range, display_order) VALUES
  ('Breakfast', '9:00–13:00', 1),
  ('Beach & Snack', '9:00–19:00', 2),
  ('Restaurant', '13:00–00:00', 3);

-- Insert initial categories
INSERT INTO menu_categories (section_id, name, icon, display_order) VALUES
  ((SELECT id FROM menu_sections WHERE name = 'Breakfast'), 'Eggs', '🥚', 1),
  ((SELECT id FROM menu_sections WHERE name = 'Breakfast'), 'Bowls', '🥣', 2),
  ((SELECT id FROM menu_sections WHERE name = 'Breakfast'), 'Toast & Sandwiches', '🥪', 3),
  ((SELECT id FROM menu_sections WHERE name = 'Breakfast'), 'Morning Sweets', '🥞', 4),
  ((SELECT id FROM menu_sections WHERE name = 'Beach & Snack'), 'Salads', '🥗', 1),
  ((SELECT id FROM menu_sections WHERE name = 'Beach & Snack'), 'Burgers', '🍔', 2),
  ((SELECT id FROM menu_sections WHERE name = 'Beach & Snack'), 'Clubs', '🥪', 3),
  ((SELECT id FROM menu_sections WHERE name = 'Beach & Snack'), 'Puccia Sandwiches', '🥖', 4),
  ((SELECT id FROM menu_sections WHERE name = 'Restaurant'), 'Raw Bar', '🦪', 1),
  ((SELECT id FROM menu_sections WHERE name = 'Restaurant'), 'Appetizers', '🥗', 2),
  ((SELECT id FROM menu_sections WHERE name = 'Restaurant'), 'Pasta & Risotto', '🍝', 3),
  ((SELECT id FROM menu_sections WHERE name = 'Restaurant'), 'Fish & Meat', '🐟', 4),
  ((SELECT id FROM menu_sections WHERE name = 'Restaurant'), 'Steaks', '🥩', 5),
  ((SELECT id FROM menu_sections WHERE name = 'Restaurant'), 'Desserts', '🍨', 6);