-- migrate:up

CREATE TABLE game_flow_solutions (
    flow_hash text PRIMARY KEY NOT NULL,
    solutions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL,
    last_updated_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL
);

-- migrate:down

DROP TABLE game_flow_solutions;

