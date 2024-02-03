-- migrate:up

ALTER TABLE user_session ADD COLUMN ended_at TIMESTAMP WITH TIME ZONE;


-- migrate:down

ALTER TABLE user_session DROP COLUMN ended_at;


