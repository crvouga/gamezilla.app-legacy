CREATE TABLE game_chess_puzzle (
  puzzle_id VARCHAR(255) PRIMARY KEY,
  rating NUMERIC,
  rating_deviation NUMERIC,
  opening_tags VARCHAR(255)[] NOT NULL,
  fen VARCHAR(255),
  moves VARCHAR(255)[] NOT NULL,
  popularity NUMERIC,
  number_of_plays INTEGER,
  themes VARCHAR(255)[] NOT NULL,
  game_url VARCHAR(255)
);
