CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE user_profile (
  user_id varchar(255) NOT NULL,
  avatar_url varchar(255) DEFAULT NULL,
  username varchar(255) DEFAULT NULL, avatar_seed TEXT, avatar_style TEXT,
  PRIMARY KEY (user_id),
  UNIQUE (username)
);
CREATE INDEX idx_username ON user_profile (username);
CREATE TABLE user_account (
  user_id TEXT NOT NULL,
  email_address TEXT, phone_number TEXT, created_at TIMESTAMP, last_logged_in_at TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE (email_address)
);
CREATE TABLE game_chess_puzzle (
  puzzle_id TEXT NOT NULL,
  rating INTEGER DEFAULT NULL,
  rating_deviation INTEGER DEFAULT NULL,
  opening_tags TEXT NOT NULL,
  fen TEXT DEFAULT NULL,
  moves TEXT NOT NULL,
  popularity INTEGER DEFAULT NULL,
  number_of_plays INTEGER DEFAULT NULL,
  themes TEXT NOT NULL,
  game_url TEXT DEFAULT NULL,
  PRIMARY KEY (puzzle_id)
);
CREATE INDEX idx_game_chess_puzzle_rating ON game_chess_puzzle (rating);
CREATE INDEX idx_game_chess_puzzle_popularity ON game_chess_puzzle (popularity);
CREATE TABLE game_chess_puzzle_profile (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  puzzle_query TEXT NOT NULL,  -- JSON data stored as text
  elo_rating INTEGER NOT NULL,
  PRIMARY KEY (id)
);
CREATE INDEX idx_game_chess_puzzle_profile_user_id ON game_chess_puzzle_profile (user_id);
CREATE TABLE game_chess_puzzle_interaction (
  id INTEGER PRIMARY KEY, -- Auto incrementing
  puzzle_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('solved', 'incorrect', 'solved-with-hint', 'started')) NOT NULL -- Text with check constraint for enum values
);
CREATE INDEX game_chess_puzzle_interaction_puzzle_id_idx ON game_chess_puzzle_interaction (puzzle_id);
CREATE INDEX game_chess_puzzle_interaction_puzzle_id_user_id_idx ON game_chess_puzzle_interaction (puzzle_id, user_id);
CREATE TABLE user_session (
    session_id TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active  BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_user_session_created_at ON user_session(created_at);
CREATE INDEX idx_user_session_session_id_created_at ON user_session(session_id, created_at);
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20231111232244'),
  ('20231112003940'),
  ('20231112220209'),
  ('20231113081720'),
  ('20231115190935'),
  ('20231116190003'),
  ('20231116191553');
