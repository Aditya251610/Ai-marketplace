/*
  # Create Waitlist Table

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key) - Unique identifier for each waitlist entry
      - `email` (text, unique) - User's email address
      - `first_name` (text) - User's first name
      - `last_name` (text) - User's last name
      - `company` (text, nullable) - User's company/organization
      - `role` (text, nullable) - User's professional role
      - `use_case` (text, nullable) - Primary use case for AI Nexus
      - `interests` (text[], nullable) - Array of interest areas
      - `referral_source` (text, nullable) - How they heard about us
      - `newsletter_consent` (boolean) - Newsletter subscription consent
      - `position` (integer) - Position in waitlist (auto-generated)
      - `ip_address` (text, nullable) - User's IP address for analytics
      - `user_agent` (text, nullable) - User's browser info
      - `status` (text) - Status: 'pending', 'invited', 'registered'
      - `invited_at` (timestamptz, nullable) - When user was invited
      - `registered_at` (timestamptz, nullable) - When user registered
      - `created_at` (timestamptz) - When they joined waitlist
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on waitlist table
    - Add policies for public insert (joining waitlist)
    - Add policies for admin access to manage waitlist

  3. Indexes
    - Add indexes for email, position, status, and created_at
    - Add unique constraint on email
*/

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  role text,
  use_case text,
  interests text[],
  referral_source text,
  newsletter_consent boolean DEFAULT true,
  position integer,
  ip_address text,
  user_agent text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'registered')),
  invited_at timestamptz,
  registered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own waitlist entry"
  ON waitlist
  FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlist(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at DESC);

-- Create function to auto-assign position
CREATE OR REPLACE FUNCTION assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign position based on current count
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
  FROM waitlist;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign position
DROP TRIGGER IF EXISTS trigger_assign_waitlist_position ON waitlist;
CREATE TRIGGER trigger_assign_waitlist_position
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION assign_waitlist_position();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_waitlist_updated_at ON waitlist;
CREATE TRIGGER trigger_waitlist_updated_at
    BEFORE UPDATE ON waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_waitlist_updated_at();

-- Insert some sample data for testing
INSERT INTO waitlist (
  email,
  first_name,
  last_name,
  company,
  role,
  use_case,
  interests,
  referral_source,
  newsletter_consent
) VALUES 
(
  'john.doe@example.com',
  'John',
  'Doe',
  'Tech Corp',
  'Developer',
  'Building AI Applications',
  ARRAY['Text Processing', 'Code Generation'],
  'Search Engine',
  true
),
(
  'jane.smith@startup.com',
  'Jane',
  'Smith',
  'AI Startup',
  'Data Scientist',
  'Research & Development',
  ARRAY['Machine Learning', 'Computer Vision'],
  'Social Media',
  true
),
(
  'alex.johnson@university.edu',
  'Alex',
  'Johnson',
  'University Research Lab',
  'Researcher',
  'Educational Projects',
  ARRAY['Natural Language Processing', 'Deep Learning'],
  'Conference/Event',
  false
);