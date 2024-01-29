-- migrate:up
CREATE TABLE user_session (
    session_id TEXT NOT NULL PRIMARY KEY,
    user_id    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_session_created_at ON user_session(created_at);
CREATE INDEX idx_user_session_session_id_created_at ON user_session(session_id, created_at);

-- migrate:down

DROP TABLE user_session;

DROP INDEX idx_user_session_created_at;

DROP INDEX idx_user_session_session_id_created_at;

