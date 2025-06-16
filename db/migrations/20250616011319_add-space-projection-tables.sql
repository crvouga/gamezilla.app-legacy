-- migrate:up

CREATE TABLE space_projection (
    id TEXT PRIMARY KEY,
    host_user_id TEXT NOT NULL,
    game_id TEXT
);
CREATE TABLE space_projection_user (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    user_id TEXT NOT NULL
);
CREATE INDEX space_projection_user_space_id_idx ON space_projection_user (space_id);
CREATE INDEX space_projection_user_user_id_idx ON space_projection_user (user_id);
CREATE INDEX space_projection_host_user_id_idx ON space_projection (host_user_id);

-- migrate:down

DROP INDEX space_projection_user_space_id_idx;
DROP INDEX space_projection_user_user_id_idx;
DROP INDEX space_projection_host_user_id_idx;
DROP TABLE space_projection_user;
DROP TABLE space_projection;
;

