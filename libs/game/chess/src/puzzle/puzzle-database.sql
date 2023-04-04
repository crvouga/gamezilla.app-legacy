--
--
-- Tables
--
--
--


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

CREATE TYPE game_chess_puzzle_interaction_type AS ENUM ('solved', 'incorrect');

CREATE TABLE game_chess_puzzle_interaction (
  id SERIAL PRIMARY KEY,
  puzzle_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  type game_chess_puzzle_interaction_type NOT NULL,
  FOREIGN KEY (puzzle_id) REFERENCES game_chess_puzzle (puzzle_id)
);

CREATE INDEX game_chess_puzzle_interaction_puzzle_id_idx ON game_chess_puzzle_interaction (puzzle_id);

--
--
--
-- Queries
--
--
--

--
SELECT DISTINCT UNNEST(opening_tags) AS unique_opening_tags
FROM game_chess_puzzle ORDER BY popularity LIMIT 10;
--
SELECT COUNT(*) FROM game_chess_puzzle
-- select all puzzles not in interaction table
SELECT * FROM game_chess_puzzle
WHERE puzzle_id NOT IN (SELECT puzzle_id FROM game_chess_puzzle_interaction);
--
SELECT gcp.*
FROM game_chess_puzzle gcp
LEFT JOIN game_chess_puzzle_interaction gcpi ON gcp.puzzle_id = gcpi.puzzle_id
WHERE gcpi.puzzle_id IS NULL;

SELECT DISTINCT unnest(themes)
FROM game_chess_puzzle;
