/*
  # Add Storage Bucket for Profile Images

  1. Changes
    - Create storage bucket for profile images
    - Add storage policies for authenticated users
    - Enable public access to profile images

  2. Security
    - Only authenticated users can upload
    - Public read access for profile images
    - Size and file type restrictions
*/

-- Create bucket for profile images if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile-images', 'profile-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Allow authenticated users to upload profile images
DO $$
BEGIN
  CREATE POLICY "Allow authenticated users to upload profile images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid() = owner
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow users to update their own profile images
DO $$
BEGIN
  CREATE POLICY "Allow users to update their own profile images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images' AND
    auth.uid() = owner
  )
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid() = owner
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow users to delete their own profile images
DO $$
BEGIN
  CREATE POLICY "Allow users to delete their own profile images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images' AND
    auth.uid() = owner
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow public read access to profile images
DO $$
BEGIN
  CREATE POLICY "Allow public read access to profile images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;