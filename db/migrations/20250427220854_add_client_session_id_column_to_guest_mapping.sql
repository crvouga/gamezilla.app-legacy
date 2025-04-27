-- migrate:up

ALTER TABLE user_guest_session_mapping ADD COLUMN client_session_id TEXT;

UPDATE user_guest_session_mapping SET client_session_id = session_id;

ALTER TABLE user_guest_session_mapping ALTER COLUMN client_session_id SET NOT NULL;


ALTER TABLE user_session ALTER COLUMN session_id DROP NOT NULL;


-- migrate:down

ALTER TABLE user_guest_session_mapping DROP COLUMN client_session_id;

DELETE FROM user_session WHERE session_id IS NULL;

ALTER TABLE user_session ALTER COLUMN session_id SET NOT NULL;
