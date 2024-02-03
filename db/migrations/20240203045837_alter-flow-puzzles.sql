-- migrate:up

ALTER TABLE game_flow_puzzle ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE game_flow_puzzle ADD COLUMN deleted_by_user_id TEXT DEFAULT NULL;

-- migrate:down

ALTER TABLE game_flow_puzzle DROP COLUMN deleted_at;
ALTER TABLE game_flow_puzzle DROP COLUMN deleted_by_user_id;

