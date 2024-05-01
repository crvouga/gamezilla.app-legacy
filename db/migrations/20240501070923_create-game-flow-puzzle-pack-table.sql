-- migrate:up

CREATE TABLE game_flow_pack (
    flow_pack_id TEXT PRIMARY KEY,
    flow_pack_name TEXT NOT NULL,
    flow_puzzle_ids TEXT[] NOT NULL,
    created_at_posix BIGINT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    last_updated_at_posix BIGINT NOT NULL,
    last_updated_by_user_id TEXT NOT NULL,
    deleted_at_posix BIGINT,
    deleted_by_user_id TEXT
);

-- migrate:down


DROP TABLE game_flow_pack;