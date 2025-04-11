-- migrate:up
ALTER TABLE game_flow_puzzle
RENAME COLUMN deleted_at TO deleted_at_posix;

ALTER TABLE game_flow_pack
RENAME COLUMN flow_pack_name TO name;

-- migrate:down

ALTER TABLE game_flow_puzzle
RENAME COLUMN deleted_at_posix TO deleted_at;

ALTER TABLE game_flow_pack
RENAME COLUMN name TO flow_pack_name;
