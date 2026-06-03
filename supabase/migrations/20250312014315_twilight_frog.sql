/*
  # Add dummy reservations data

  1. Changes
    - Add sample reservations for different venues
    - Include various statuses, party sizes, and occasions
    - Add sample allergy associations using a safer approach
*/

-- Insert dummy reservations
WITH venue_ids AS (
  SELECT id, name FROM venues
),
time_slot_ids AS (
  SELECT id, venue_id, time FROM time_slots
),
inserted_reservations AS (
  INSERT INTO reservations (
    venue_id,
    date,
    time_slot_id,
    time,
    party_size,
    occasion,
    dietary_restrictions,
    status,
    first_name,
    last_name,
    email,
    telephone
  )
  SELECT
    v.id as venue_id,
    -- Generate dates from today to 7 days in the future
    (CURRENT_DATE + (n || ' days')::interval)::date as date,
    ts.id as time_slot_id,
    ts.time as time,
    -- Random party size between 2 and 8
    floor(random() * 7 + 2)::int as party_size,
    -- Random occasion
    CASE floor(random() * 6)
      WHEN 0 THEN 'Birthday'
      WHEN 1 THEN 'Anniversary'
      WHEN 2 THEN 'Business'
      WHEN 3 THEN 'Date Night'
      WHEN 4 THEN 'Special Occasion'
      ELSE 'None'
    END as occasion,
    -- Random dietary restrictions
    CASE WHEN random() > 0.7 THEN 'No spicy food' ELSE NULL END as dietary_restrictions,
    -- Random status with confirmed being more common
    CASE WHEN random() > 0.8 
      THEN CASE WHEN random() > 0.5 THEN 'cancelled' ELSE 'completed' END
      ELSE 'confirmed'
    END as status,
    -- Random first names
    CASE floor(random() * 5)
      WHEN 0 THEN 'John'
      WHEN 1 THEN 'Maria'
      WHEN 2 THEN 'Alex'
      WHEN 3 THEN 'Sophie'
      ELSE 'Michael'
    END as first_name,
    -- Random last names
    CASE floor(random() * 5)
      WHEN 0 THEN 'Smith'
      WHEN 1 THEN 'Johnson'
      WHEN 2 THEN 'Brown'
      WHEN 3 THEN 'Davis'
      ELSE 'Wilson'
    END as last_name,
    -- Generate emails based on names
    lower(
      CASE floor(random() * 5)
        WHEN 0 THEN 'john.smith'
        WHEN 1 THEN 'maria.johnson'
        WHEN 2 THEN 'alex.brown'
        WHEN 3 THEN 'sophie.davis'
        ELSE 'michael.wilson'
      END || '@example.com'
    ) as email,
    -- Random phone numbers
    '+30' || floor(random() * (999999999 - 100000000) + 100000000)::text as telephone
  FROM 
    venue_ids v
    CROSS JOIN generate_series(0, 7) n
    -- Join with a random time slot for each venue
    JOIN time_slot_ids ts ON ts.venue_id = v.id
  WHERE 
    -- Only insert for about 30% of the possible combinations to avoid too many reservations
    random() < 0.3
  RETURNING id
)
-- Add allergies to random reservations using a safer approach
INSERT INTO reservation_allergies (reservation_id, allergy_id)
SELECT DISTINCT
  r.id as reservation_id,
  a.id as allergy_id
FROM 
  inserted_reservations r
  CROSS JOIN (
    SELECT id 
    FROM allergies 
    ORDER BY random() 
    LIMIT 3
  ) a
WHERE 
  random() < 0.3;