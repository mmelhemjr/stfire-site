/*
  # Add Detailed Customer Profile Fields

  1. Changes to users table
    - Add preferences field (JSONB) for storing dining preferences
    - Add notes field for staff notes
    - Add loyalty_points field for tracking customer loyalty
    - Add visit_count field for tracking total visits
    - Add last_visit field for tracking most recent visit
    - Add preferred_area_id for tracking preferred dining area
    - Add preferred_table_type_id for seating preferences
    - Add special_dates field (JSONB) for birthdays, anniversaries, etc.
    - Add vip_status field for VIP customer tracking
    - Add communication_preferences field (JSONB) for notification settings

  2. Security
    - Update RLS policies to allow staff access to profile data
    - Add function to calculate VIP status
*/

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN notes TEXT,
ADD COLUMN loyalty_points INTEGER DEFAULT 0,
ADD COLUMN visit_count INTEGER DEFAULT 0,
ADD COLUMN last_visit TIMESTAMPTZ,
ADD COLUMN preferred_area_id UUID REFERENCES areas(id),
ADD COLUMN preferred_table_type_id UUID REFERENCES table_types(id),
ADD COLUMN special_dates JSONB DEFAULT '{}'::jsonb,
ADD COLUMN vip_status BOOLEAN DEFAULT false,
ADD COLUMN communication_preferences JSONB DEFAULT '{"email": true, "sms": true, "marketing": false}'::jsonb;

-- Create function to calculate VIP status
CREATE OR REPLACE FUNCTION calculate_vip_status(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT 
      CASE 
        WHEN visit_count >= 10 OR loyalty_points >= 1000 THEN true
        ELSE false
      END
    FROM users
    WHERE id = p_user_id
  );
END;
$$;

-- Create function to update visit statistics
CREATE OR REPLACE FUNCTION update_visit_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only process completed reservations
  IF NEW.status = 'completed' AND NEW.user_id IS NOT NULL THEN
    UPDATE users
    SET 
      visit_count = visit_count + 1,
      last_visit = NOW(),
      loyalty_points = loyalty_points + 
        CASE 
          WHEN EXTRACT(DOW FROM NEW.date) IN (5, 6) THEN 20  -- Weekend bonus
          ELSE 10
        END
    WHERE id = NEW.user_id;
    
    -- Recalculate VIP status
    UPDATE users
    SET vip_status = calculate_vip_status(id)
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updating visit statistics
DROP TRIGGER IF EXISTS update_visit_stats_trigger ON reservations;
CREATE TRIGGER update_visit_stats_trigger
  AFTER UPDATE OF status ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_visit_stats();

-- Update policies for user profile access
CREATE POLICY "Staff can view all user profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid()) OR
    id = auth.uid()
  );

CREATE POLICY "Staff can update user profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    is_admin(auth.uid()) OR
    id = auth.uid()
  )
  WITH CHECK (
    is_admin(auth.uid()) OR
    id = auth.uid()
  );

-- Add indexes for performance
CREATE INDEX idx_users_vip_status ON users(vip_status);
CREATE INDEX idx_users_loyalty_points ON users(loyalty_points);
CREATE INDEX idx_users_visit_count ON users(visit_count);
CREATE INDEX idx_users_last_visit ON users(last_visit);