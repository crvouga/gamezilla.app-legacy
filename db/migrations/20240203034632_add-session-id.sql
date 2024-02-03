-- migrate:up

ALTER TABLE user_session ADD COLUMN session_id TEXT;

-- migrate:down

ALTER TABLE user_session DROP COLUMN session_id;



