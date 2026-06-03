/*
  # Site Statistics Schema

  1. New Tables
    - page_views: Track page views with URL and user info
    - events: Track user events with custom data
    - site_statistics: Aggregate statistics

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add functions for tracking
*/

-- Create page_views table
CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  page_url text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create site_statistics table for aggregated data
CREATE TABLE site_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  total_events integer DEFAULT 0,
  popular_pages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admins to view all page views"
ON page_views
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Allow admins to view all events"
ON events
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Allow admins to view site statistics"
ON site_statistics
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Create function to track page views
CREATE OR REPLACE FUNCTION track_page_view(
  p_page_url text,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO page_views (user_id, page_url, referrer, user_agent)
  VALUES (auth.uid(), p_page_url, p_referrer, p_user_agent);
END;
$$;

-- Create function to track events
CREATE OR REPLACE FUNCTION track_event(
  p_event_name text,
  p_event_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO events (user_id, event_name, event_data)
  VALUES (auth.uid(), p_event_name, p_event_data);
END;
$$;

-- Create function to update daily statistics
CREATE OR REPLACE FUNCTION update_daily_statistics(p_date date)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_page_views integer;
  v_unique_visitors integer;
  v_total_events integer;
  v_popular_pages jsonb;
BEGIN
  -- Calculate page views
  SELECT COUNT(*) INTO v_page_views
  FROM page_views
  WHERE DATE(created_at) = p_date;

  -- Calculate unique visitors
  SELECT COUNT(DISTINCT user_id) INTO v_unique_visitors
  FROM page_views
  WHERE DATE(created_at) = p_date;

  -- Calculate total events
  SELECT COUNT(*) INTO v_total_events
  FROM events
  WHERE DATE(created_at) = p_date;

  -- Calculate popular pages
  SELECT jsonb_agg(popular_pages)
  INTO v_popular_pages
  FROM (
    SELECT 
      page_url,
      COUNT(*) as views
    FROM page_views
    WHERE DATE(created_at) = p_date
    GROUP BY page_url
    ORDER BY COUNT(*) DESC
    LIMIT 10
  ) as popular_pages;

  -- Insert or update statistics
  INSERT INTO site_statistics (
    date,
    page_views,
    unique_visitors,
    total_events,
    popular_pages
  )
  VALUES (
    p_date,
    v_page_views,
    v_unique_visitors,
    v_total_events,
    v_popular_pages
  )
  ON CONFLICT (date)
  DO UPDATE SET
    page_views = v_page_views,
    unique_visitors = v_unique_visitors,
    total_events = v_total_events,
    popular_pages = v_popular_pages;
END;
$$;

-- Create trigger to update statistics after page view
CREATE OR REPLACE FUNCTION update_statistics_on_page_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM update_daily_statistics(DATE(NEW.created_at));
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_stats_after_page_view
  AFTER INSERT ON page_views
  FOR EACH ROW
  EXECUTE FUNCTION update_statistics_on_page_view();

-- Create trigger to update statistics after event
CREATE OR REPLACE FUNCTION update_statistics_on_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM update_daily_statistics(DATE(NEW.created_at));
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_stats_after_event
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_statistics_on_event();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION track_page_view(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION track_event(text, jsonb) TO authenticated;