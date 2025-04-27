-- migrate:up

DELETE FROM user_session WHERE session_id IS NULL;

ALTER TABLE user_session ALTER COLUMN session_id SET NOT NULL;


-- migrate:down


ALTER TABLE user_session ALTER COLUMN session_id DROP NOT NULL;