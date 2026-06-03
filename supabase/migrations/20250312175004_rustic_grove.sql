/*
  # Create admin user mikejr@saintfire.com

  1. Changes
    - Insert new admin user into users table
    - Set role as 'admin'

  2. Security
    - Maintains existing RLS policies
*/

-- Insert or update admin user
INSERT INTO users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'mikejr@saintfire.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';