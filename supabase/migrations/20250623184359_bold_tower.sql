/*
  # AI Agent Marketplace Database Schema

  1. New Tables
    - `agents`
      - `id` (uuid, primary key) - Unique identifier for each AI agent
      - `name` (text) - Display name of the agent
      - `description` (text) - Detailed description of what the agent does
      - `category` (text) - Category classification (Text Processing, Image Analysis, etc.)
      - `ipfs_hash` (text) - IPFS hash where the model is stored
      - `price_eth` (text) - License price in ETH (stored as string for precision)
      - `creator_address` (text) - Ethereum address of the agent creator
      - `usage_count` (integer) - Number of times the agent has been used
      - `rating` (numeric) - Average rating (calculated from reviews)
      - `total_ratings` (integer) - Total number of ratings received
      - `sample_input` (text) - Example input for testing
      - `sample_output` (text) - Expected output for the sample input
      - `language` (text) - Programming language (Python, JavaScript, etc.)
      - `is_active` (boolean) - Whether the agent is available for licensing
      - `created_at` (timestamptz) - When the agent was uploaded
      - `updated_at` (timestamptz) - Last modification time

    - `benchmarks`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, foreign key) - Reference to the agent
      - `latency_ms` (integer) - Response time in milliseconds
      - `cost_usd` (numeric) - Cost per execution in USD
      - `accuracy_score` (integer) - Performance score (0-100)
      - `created_at` (timestamptz) - When the benchmark was recorded

    - `user_licenses`
      - `id` (uuid, primary key)
      - `user_address` (text) - Ethereum address of the user
      - `agent_id` (uuid, foreign key) - Reference to the licensed agent
      - `transaction_hash` (text) - Blockchain transaction hash
      - `created_at` (timestamptz) - When the license was purchased
      - `expires_at` (timestamptz, nullable) - License expiration (null for lifetime)

    - `reviews`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, foreign key) - Reference to the reviewed agent
      - `user_address` (text) - Ethereum address of the reviewer
      - `rating` (integer) - Rating from 1-5 stars
      - `comment` (text) - Written review comment
      - `created_at` (timestamptz) - When the review was submitted

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to agents and reviews
    - Add policies for authenticated users to manage their own data
    - Add policies for creators to manage their agents

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for filtering and sorting
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  ipfs_hash text NOT NULL,
  price_eth text NOT NULL DEFAULT '0',
  creator_address text NOT NULL,
  usage_count integer DEFAULT 0,
  rating numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  sample_input text DEFAULT '',
  sample_output text DEFAULT '',
  language text DEFAULT 'Python',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create benchmarks table
CREATE TABLE IF NOT EXISTS benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  latency_ms integer NOT NULL,
  cost_usd numeric NOT NULL DEFAULT 0,
  accuracy_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_licenses table
CREATE TABLE IF NOT EXISTS user_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  transaction_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  user_address text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for agents table
CREATE POLICY "Agents are viewable by everyone"
  ON agents
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own agents"
  ON agents
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can update their own agents"
  ON agents
  FOR UPDATE
  USING (true);

-- Create policies for benchmarks table
CREATE POLICY "Benchmarks are viewable by everyone"
  ON benchmarks
  FOR SELECT
  USING (true);

CREATE POLICY "Benchmarks can be inserted by anyone"
  ON benchmarks
  FOR INSERT
  WITH CHECK (true);

-- Create policies for user_licenses table
CREATE POLICY "Users can view their own licenses"
  ON user_licenses
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own licenses"
  ON user_licenses
  FOR INSERT
  WITH CHECK (true);

-- Create policies for reviews table
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_creator ON agents(creator_address);
CREATE INDEX IF NOT EXISTS idx_agents_rating ON agents(rating DESC);
CREATE INDEX IF NOT EXISTS idx_agents_usage ON agents(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_agents_created ON agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);

CREATE INDEX IF NOT EXISTS idx_benchmarks_agent ON benchmarks(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_licenses_user ON user_licenses(user_address);
CREATE INDEX IF NOT EXISTS idx_user_licenses_agent ON user_licenses(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agent ON reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_address);

-- Insert seed data for development
INSERT INTO agents (
  id,
  name,
  description,
  category,
  ipfs_hash,
  price_eth,
  creator_address,
  usage_count,
  rating,
  total_ratings,
  sample_input,
  sample_output,
  language,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'Text Summarizer Pro',
  'Advanced text summarization using BART-Large-CNN model. Capable of processing long documents and articles to generate concise, accurate summaries.',
  'Text Processing',
  'bafybeiexamplemodelhash1',
  '0.01',
  '0x123456789abcdef123456789abcdef1234567890',
  2847,
  4.8,
  124,
  'Long news article or document text that needs to be summarized into a shorter, more digestible format while preserving the key information and main points.',
  'Concise, accurate summary preserving key information and main ideas from the original text in a structured format.',
  'Python',
  true
),
(
  '00000000-0000-0000-0000-000000000002',
  'Sentiment Analyzer',
  'Real-time sentiment analysis for text and social media content. Uses advanced NLP techniques to determine emotional tone and polarity.',
  'Text Processing',
  'bafybeisample2',
  '0',
  '0x123456789abcdef123456789abcdef1234567890',
  1653,
  4.2,
  89,
  'I love this product! It works perfectly and exceeded my expectations. The quality is amazing.',
  'Positive sentiment detected (confidence: 92.4%) - Strong positive emotional indicators found in text.',
  'Python',
  true
),
(
  '00000000-0000-0000-0000-000000000003',
  'Image Caption Generator',
  'Generate detailed, contextual captions for images using state-of-the-art computer vision and natural language processing.',
  'Image Analysis',
  'bafybeiexampleimg',
  '0.02',
  '0x456789abcdef123456789abcdef123456789abcde',
  892,
  4.9,
  67,
  '[Image upload - person riding bicycle through city street]',
  'A person wearing casual clothing rides a blue bicycle through a busy city street during daytime, with buildings and pedestrians visible in the background.',
  'Python',
  true
);

-- Insert benchmark data
INSERT INTO benchmarks (agent_id, latency_ms, cost_usd, accuracy_score) VALUES
('00000000-0000-0000-0000-000000000001', 380, 0.001, 82),
('00000000-0000-0000-0000-000000000002', 120, 0.0005, 91),
('00000000-0000-0000-0000-000000000003', 800, 0.003, 88);

-- Insert sample reviews
INSERT INTO reviews (agent_id, user_address, rating, comment) VALUES
('00000000-0000-0000-0000-000000000001', '0x789abcdef123456789abcdef123456789abcdef12', 5, 'Excellent summarization quality! Very accurate and preserves important details.'),
('00000000-0000-0000-0000-000000000001', '0x9abcdef123456789abcdef123456789abcdef123', 4, 'Good performance but could be faster for large documents.'),
('00000000-0000-0000-0000-000000000002', '0x789abcdef123456789abcdef123456789abcdef12', 4, 'Accurate sentiment detection, works well for social media content.'),
('00000000-0000-0000-0000-000000000002', '0xabcdef123456789abcdef123456789abcdef1234', 3, 'Decent results but sometimes struggles with sarcasm.'),
('00000000-0000-0000-0000-000000000003', '0x789abcdef123456789abcdef123456789abcdef12', 5, 'Amazing image captions! Very detailed and contextually accurate.'),
('00000000-0000-0000-0000-000000000003', '0xbcdef123456789abcdef123456789abcdef12345', 5, 'Top quality results, perfect for accessibility applications.');

-- Create function to update agent ratings
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agents 
  SET 
    rating = (
      SELECT AVG(rating)::numeric 
      FROM reviews 
      WHERE agent_id = NEW.agent_id
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE agent_id = NEW.agent_id
    ),
    updated_at = now()
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update ratings
DROP TRIGGER IF EXISTS trigger_update_agent_rating ON reviews;
CREATE TRIGGER trigger_update_agent_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_rating();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for agents table
DROP TRIGGER IF EXISTS trigger_agents_updated_at ON agents;
CREATE TRIGGER trigger_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();