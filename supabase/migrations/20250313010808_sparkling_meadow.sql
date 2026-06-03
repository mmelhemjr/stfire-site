/*
  # Add Profile Image Support

  1. Changes
    - Add profile_image column to users table
    - Add policy for users to update their profile image
*/

-- Add profile_image column to users table
ALTER TABLE users
ADD COLUMN profile_image text;

-- Update policies to allow users to update their profile image
CREATE POLICY "Users can update their own profile image"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);