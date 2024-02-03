-- migrate:up

DROP TABLE game_flow_puzzles;

CREATE TABLE game_flow_puzzle (
  flow_puzzle_id TEXT PRIMARY KEY,
  flow_puzzle_name TEXT NOT NULL,
  flow_puzzle JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by_user_id TEXT NOT NULL,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_updated_by_user_id TEXT NOT NULL
);


-- migrate:down


DROP TABLE game_flow_puzzle;

CREATE TABLE game_flow_puzzles (
  flow_puzzle_id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by_user_id TEXT NOT NULL,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_updated_by_user_id TEXT NOT NULL,
  puzzle JSON NOT NULL
);
