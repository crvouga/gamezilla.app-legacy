-- migrate:up

CREATE TABLE space (
    id TEXT PRIMARY KEY,
    created_at_unix_ms BIGINT NOT NULL,
    updated_at_unix_ms BIGINT NOT NULL,
    deleted_at_unix_ms BIGINT,
    model JSONB NOT NULL
)

-- migrate:down

DROP TABLE space;