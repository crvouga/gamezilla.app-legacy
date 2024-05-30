-- migrate:up
ALTER TABLE user_profile ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_profile ALTER COLUMN username TYPE TEXT;
ALTER TABLE user_profile ALTER COLUMN username SET NOT NULL;
ALTER TABLE user_profile ALTER COLUMN username DROP DEFAULT;



-- migrate:down


ALTER TABLE user_profile ALTER COLUMN user_id TYPE VARCHAR(255);

ALTER TABLE user_profile ALTER COLUMN username DROP NOT NULL;
ALTER TABLE user_profile ALTER COLUMN username TYPE VARCHAR(255);

