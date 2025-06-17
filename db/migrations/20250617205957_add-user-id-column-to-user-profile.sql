-- migrate:up

ALTER TABLE user_profile ADD COLUMN user_id TEXT;

UPDATE user_profile SET user_id = id;

ALTER TABLE user_profile ALTER COLUMN user_id SET NOT NULL;

UPDATE user_profile SET id = REPLACE(id, 'user:', 'user-profile:');

-- migrate:down

UPDATE user_profile SET id = REPLACE(id, 'user-profile:', 'user:');

ALTER TABLE user_profile DROP COLUMN user_id;
