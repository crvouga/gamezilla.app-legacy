-- migrate:up
ALTER TABLE user_profile ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_profile ALTER COLUMN username SET TEXT;


-- migrate:down

