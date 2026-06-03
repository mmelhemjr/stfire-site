/*
  # Add Admin User

  1. Changes
    - Add mikejr@saintfire.com as an admin user
    - Ensure user exists in users table with admin role

  2. Security
    - Uses existing RLS policies
    - Maintains security context
*/

-- Insert or update admin user
INSERT INTO users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'mikejr@saintfire.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';