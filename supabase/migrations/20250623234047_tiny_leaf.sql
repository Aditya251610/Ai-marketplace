/*
  # Developer Subscriptions Schema

  1. New Tables
    - `developer_subscriptions`
      - `id` (uuid, primary key)
      - `stripe_subscription_id` (text, unique) - Stripe subscription ID
      - `stripe_customer_id` (text) - Stripe customer ID
      - `wallet_address` (text) - Developer's wallet address
      - `plan_id` (text) - Plan identifier (starter, professional, enterprise)
      - `billing_period` (text) - Billing period (weekly, monthly, quarterly, yearly)
      - `status` (text) - Subscription status (active, cancelled, past_due, etc.)
      - `uploads_remaining` (integer) - Remaining uploads in current period
      - `uploads_total` (integer) - Total uploads allowed per period
      - `current_period_start` (timestamptz) - Current billing period start
      - `current_period_end` (timestamptz) - Current billing period end
      - `last_payment_at` (timestamptz) - Last successful payment
      - `cancelled_at` (timestamptz) - When subscription was cancelled
      - `created_at` (timestamptz) - When subscription was created
      - `updated_at` (timestamptz) - Last update time

    - `subscription_sessions`
      - `id` (uuid, primary key)
      - `session_id` (text, unique) - Stripe checkout session ID
      - `wallet_address` (text) - User's wallet address
      - `plan_id` (text) - Selected plan
      - `billing_period` (text) - Selected billing period
      - `price_id` (text) - Stripe price ID
      - `status` (text) - Session status (pending, completed, expired)
      - `stripe_customer_id` (text) - Stripe customer ID (after completion)
      - `stripe_subscription_id` (text) - Stripe subscription ID (after completion)
      - `created_at` (timestamptz) - Session creation time

    - `subscription_uploads`
      - `id` (uuid, primary key)
      - `subscription_id` (uuid, foreign key) - Reference to subscription
      - `agent_id` (text) - ID of uploaded agent
      - `wallet_address` (text) - Developer's wallet address
      - `created_at` (timestamptz) - Upload timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own subscriptions
    - Add policies for webhook access

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for performance
*/

-- Create developer_subscriptions table
CREATE TABLE IF NOT EXISTS developer_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  wallet_address text NOT NULL,
  plan_id text NOT NULL CHECK (plan_id IN ('starter', 'professional', 'enterprise')),
  billing_period text NOT NULL CHECK (billing_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  status text NOT NULL DEFAULT 'active',
  uploads_remaining integer NOT NULL DEFAULT 0,
  uploads_total integer NOT NULL DEFAULT 0,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  last_payment_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_sessions table
CREATE TABLE IF NOT EXISTS subscription_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  wallet_address text NOT NULL,
  plan_id text NOT NULL,
  billing_period text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now()
);

-- Create subscription_uploads table
CREATE TABLE IF NOT EXISTS subscription_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES developer_subscriptions(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  wallet_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE developer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for developer_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON developer_subscriptions
  FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "System can manage all subscriptions"
  ON developer_subscriptions
  FOR ALL
  USING (true);

-- Create policies for subscription_sessions
CREATE POLICY "Users can view their own sessions"
  ON subscription_sessions
  FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "System can manage all sessions"
  ON subscription_sessions
  FOR ALL
  USING (true);

-- Create policies for subscription_uploads
CREATE POLICY "Users can view their own uploads"
  ON subscription_uploads
  FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "System can manage all uploads"
  ON subscription_uploads
  FOR ALL
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_developer_subscriptions_wallet ON developer_subscriptions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_developer_subscriptions_stripe_sub ON developer_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_developer_subscriptions_status ON developer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_developer_subscriptions_period_end ON developer_subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_subscription_sessions_session ON subscription_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_subscription_sessions_wallet ON subscription_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_subscription_sessions_status ON subscription_sessions(status);

CREATE INDEX IF NOT EXISTS idx_subscription_uploads_subscription ON subscription_uploads(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_uploads_wallet ON subscription_uploads(wallet_address);
CREATE INDEX IF NOT EXISTS idx_subscription_uploads_agent ON subscription_uploads(agent_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_subscription_updated_at ON developer_subscriptions;
CREATE TRIGGER trigger_subscription_updated_at
    BEFORE UPDATE ON developer_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- Insert sample subscription data for testing
INSERT INTO developer_subscriptions (
  stripe_subscription_id,
  stripe_customer_id,
  wallet_address,
  plan_id,
  billing_period,
  status,
  uploads_remaining,
  uploads_total,
  current_period_start,
  current_period_end
) VALUES 
(
  'sub_test_starter_monthly',
  'cus_test_starter',
  '0x123456789abcdef123456789abcdef1234567890',
  'starter',
  'monthly',
  'active',
  6,
  8,
  now(),
  now() + interval '1 month'
),
(
  'sub_test_pro_yearly',
  'cus_test_pro',
  '0x456789abcdef123456789abcdef123456789abcde',
  'professional',
  'yearly',
  'active',
  240,
  260,
  now(),
  now() + interval '1 year'
);