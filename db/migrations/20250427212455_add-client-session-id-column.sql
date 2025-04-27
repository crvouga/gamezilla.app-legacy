-- migrate:up

ALTER TABLE user_session ADD COLUMN client_session_id TEXT;

UPDATE user_session SET client_session_id = session_id;

ALTER TABLE user_session ALTER COLUMN client_session_id SET NOT NULL;

ALTER TABLE user_session ALTER COLUMN session_id DROP NOT NULL;


-- migrate:down

ALTER TABLE user_session DROP COLUMN client_session_id;

DELETE FROM user_session WHERE session_id IS NULL;

ALTER TABLE user_session ALTER COLUMN session_id SET NOT NULL;
