-- migrate:up

UPDATE user_session SET session_id = user_session_id;
ALTER TABLE user_session ALTER COLUMN user_session_id SET NOT NULL;

-- migrate:down

ALTER TABLE user_session ALTER COLUMN user_session_id DROP NOT NULL;


