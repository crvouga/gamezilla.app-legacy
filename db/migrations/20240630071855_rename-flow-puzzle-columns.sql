-- migrate:up

ALTER TABLE game_flow_puzzle RENAME COLUMN flow_puzzle TO flow;
ALTER TABLE game_flow_puzzle RENAME COLUMN created_at TO created_at_posix;
ALTER TABLE game_flow_puzzle RENAME COLUMN last_updated_at TO last_updated_at_posix;
ALTER TABLE game_flow_puzzle ADD COLUMN flow_solutions JSONB NOT NULL DEFAULT '[]'::JSONB;
UPDATE game_flow_puzzle SET flow_solutions = '[]'::JSONB;

-- migrate:down

ALTER TABLE game_flow_puzzle RENAME COLUMN flow TO flow_puzzle;
ALTER TABLE game_flow_puzzle RENAME COLUMN created_at_posix TO created_at;
ALTER TABLE game_flow_puzzle RENAME COLUMN last_updated_at_posix TO last_updated_at;
ALTER TABLE game_flow_puzzle DROP COLUMN flow_solutions;
