/*
  # Initial Schema Setup for Mood Tracker App

  1. Tables
    - moods
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - mood (text)
      - entry (text)
      - created_at (timestamp)
    
    - recommendations
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - mood_id (uuid, references moods)
      - type (text) - either 'music' or 'movie'
      - content_id (text)
      - title (text)
      - description (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific data access
*/

-- Create moods table
CREATE TABLE IF NOT EXISTS moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  mood text NOT NULL,
  entry text,
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  mood_id uuid REFERENCES moods NOT NULL,
  type text NOT NULL CHECK (type IN ('music', 'movie')),
  content_id text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for moods table
CREATE POLICY "Users can insert their own moods"
  ON moods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own moods"
  ON moods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for recommendations table
CREATE POLICY "Users can insert their own recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);