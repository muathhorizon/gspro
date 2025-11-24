/*
  # Guess Challenge Game Schema

  ## Overview
  Complete database schema for the AI-powered guessing challenge game.
  Supports multiple themes, game sessions, leaderboard tracking, and entity management.

  ## 1. New Tables

  ### `themes`
  Stores different game themes (Football, Movies, Games, etc.)
  - `id` (uuid, primary key)
  - `name` (text, unique) - Theme name
  - `description` (text) - Theme description
  - `icon` (text) - Icon identifier
  - `is_active` (boolean) - Whether theme is available
  - `created_at` (timestamptz)

  ### `entities`
  Stores the hidden entities that players need to guess
  - `id` (uuid, primary key)
  - `theme_id` (uuid, foreign key) - Links to themes table
  - `name` (text) - Entity name
  - `description` (text) - Brief description
  - `difficulty` (text) - easy/medium/hard
  - `hints` (jsonb) - Array of hint data
  - `attributes` (jsonb) - Key attributes for AI question generation
  - `created_at` (timestamptz)

  ### `game_sessions`
  Tracks individual game sessions
  - `id` (uuid, primary key)
  - `player_name` (text) - Player identifier
  - `theme_id` (uuid, foreign key)
  - `entity_id` (uuid, foreign key)
  - `difficulty` (text) - Game difficulty level
  - `questions_asked` (integer) - Number of questions used
  - `time_spent` (integer) - Seconds spent
  - `status` (text) - in_progress/won/lost
  - `score` (integer) - Calculated score
  - `conversation` (jsonb) - Question/answer history
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### `leaderboard`
  Stores top player scores
  - `id` (uuid, primary key)
  - `player_name` (text)
  - `theme_id` (uuid, foreign key)
  - `difficulty` (text)
  - `score` (integer)
  - `questions_asked` (integer)
  - `time_spent` (integer)
  - `entity_guessed` (text)
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Public read access for themes and entities
  - Game sessions are publicly writable for gameplay
  - Leaderboard is publicly readable and writable

  ## 3. Indexes
  - Index on theme_id for fast entity lookups
  - Index on leaderboard scores for ranking
  - Index on game session status for active games

  ## 4. Important Notes
  - All tables use UUID primary keys for scalability
  - JSONB used for flexible data structures (hints, attributes, conversation)
  - Timestamps track game progression
  - RLS policies allow public gameplay without authentication
*/

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create entities table
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid REFERENCES themes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  hints jsonb DEFAULT '[]'::jsonb,
  attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  theme_id uuid REFERENCES themes(id) ON DELETE CASCADE NOT NULL,
  entity_id uuid REFERENCES entities(id) ON DELETE CASCADE NOT NULL,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  questions_asked integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  status text CHECK (status IN ('in_progress', 'won', 'lost')) DEFAULT 'in_progress',
  score integer DEFAULT 0,
  conversation jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  theme_id uuid REFERENCES themes(id) ON DELETE CASCADE NOT NULL,
  difficulty text NOT NULL,
  score integer NOT NULL,
  questions_asked integer NOT NULL,
  time_spent integer NOT NULL,
  entity_guessed text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for themes (public read)
CREATE POLICY "Anyone can view active themes"
  ON themes FOR SELECT
  USING (is_active = true);

-- RLS Policies for entities (public read)
CREATE POLICY "Anyone can view entities"
  ON entities FOR SELECT
  USING (true);

-- RLS Policies for game_sessions (public read/write for gameplay)
CREATE POLICY "Anyone can view game sessions"
  ON game_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game sessions"
  ON game_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for leaderboard (public read/write)
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add to leaderboard"
  ON leaderboard FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_theme_id ON entities(theme_id);
CREATE INDEX IF NOT EXISTS idx_entities_difficulty ON entities(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_theme_id ON game_sessions(theme_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_theme_difficulty ON leaderboard(theme_id, difficulty);

-- Insert default themes
INSERT INTO themes (name, description, icon) VALUES
  ('Football', 'Guess famous football players from around the world', '⚽'),
  ('Movies', 'Identify iconic movie characters and films', '🎬'),
  ('Video Games', 'Discover legendary video game characters', '🎮'),
  ('Music', 'Find out which music artists and bands', '🎵')
ON CONFLICT (name) DO NOTHING;

-- Insert sample entities for Football theme
INSERT INTO entities (theme_id, name, description, difficulty, attributes) 
SELECT 
  t.id,
  'Lionel Messi',
  'Argentine professional footballer, widely regarded as one of the greatest players of all time',
  'easy',
  '{"nationality": "Argentina", "position": "Forward", "current_team": "Inter Miami", "famous_for": "Dribbling and goalscoring", "awards": ["8x Ballon d''Or", "World Cup 2022"]}'::jsonb
FROM themes t WHERE t.name = 'Football'
ON CONFLICT DO NOTHING;

INSERT INTO entities (theme_id, name, description, difficulty, attributes) 
SELECT 
  t.id,
  'Cristiano Ronaldo',
  'Portuguese professional footballer, one of the most decorated players in history',
  'easy',
  '{"nationality": "Portugal", "position": "Forward", "current_team": "Al Nassr", "famous_for": "Athleticism and goalscoring", "awards": ["5x Ballon d''Or", "5x Champions League"]}'::jsonb
FROM themes t WHERE t.name = 'Football'
ON CONFLICT DO NOTHING;

-- Insert sample entities for Movies theme
INSERT INTO entities (theme_id, name, description, difficulty, attributes) 
SELECT 
  t.id,
  'Iron Man',
  'Billionaire genius Tony Stark who built a high-tech suit of armor',
  'easy',
  '{"universe": "Marvel", "real_name": "Tony Stark", "powers": "Technology and intelligence", "first_appearance": "Iron Man (2008)", "actor": "Robert Downey Jr."}'::jsonb
FROM themes t WHERE t.name = 'Movies'
ON CONFLICT DO NOTHING;

INSERT INTO entities (theme_id, name, description, difficulty, attributes) 
SELECT 
  t.id,
  'Darth Vader',
  'Iconic villain from Star Wars, once a Jedi Knight named Anakin Skywalker',
  'easy',
  '{"universe": "Star Wars", "real_name": "Anakin Skywalker", "side": "Dark Side", "weapon": "Red Lightsaber", "famous_line": "I am your father"}'::jsonb
FROM themes t WHERE t.name = 'Movies'
ON CONFLICT DO NOTHING;

-- Insert sample entities for Video Games theme
INSERT INTO entities (theme_id, name, description, difficulty, attributes) 
SELECT 
  t.id,
  'Mario',
  'Nintendo''s iconic plumber who saves Princess Peach',
  'easy',
  '{"game": "Super Mario", "company": "Nintendo", "occupation": "Plumber", "signature_move": "Jump", "color": "Red and blue"}'::jsonb
FROM themes t WHERE t.name = 'Video Games'
ON CONFLICT DO NOTHING;

INSERT INTO entities (theme_id, name, description, difficulty, attributes) 
SELECT 
  t.id,
  'Link',
  'The legendary hero of Hyrule from The Legend of Zelda series',
  'medium',
  '{"game": "The Legend of Zelda", "company": "Nintendo", "weapon": "Master Sword", "companion": "Navi/Zelda", "color": "Green tunic"}'::jsonb
FROM themes t WHERE t.name = 'Video Games'
ON CONFLICT DO NOTHING;