-- migrate:up

CREATE TABLE game_flow_puzzles (
  flow_puzzle_id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by_user_id TEXT NOT NULL,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_updated_by_user_id TEXT NOT NULL,
  puzzle JSON NOT NULL
);


-- migrate:down


DROP TABLE game_flow_puzzles;

