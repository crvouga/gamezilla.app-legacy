-- migrate:up

CREATE TABLE user_guest_session_mapping (
    user_id text NOT NULL,
    session_id text NOT NULL,
    created_at_posix bigint NOT NULL
);

CREATE INDEX idx_user_guest_session_mapping_session_id ON user_guest_session_mapping (session_id);
CREATE INDEX idx_user_guest_session_mapping_user_id ON user_guest_session_mapping (user_id);


-- migrate:down

DROP INDEX idx_user_guest_session_mapping_session_id;
DROP INDEX idx_user_guest_session_mapping_user_id;
DROP TABLE user_guest_session_mapping;

