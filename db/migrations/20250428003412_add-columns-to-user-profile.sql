-- migrate:up

ALTER TABLE user_profile ADD COLUMN user_id text;
UPDATE user_profile SET user_id = id;
ALTER TABLE user_profile ALTER COLUMN user_id SET NOT NULL;


ALTER TABLE user_profile ADD COLUMN created_at_posix bigint;
UPDATE user_profile SET created_at_posix = EXTRACT(EPOCH FROM NOW())::bigint;
ALTER TABLE user_profile ALTER COLUMN created_at_posix SET NOT NULL;



ALTER TABLE user_profile ADD COLUMN updated_at_posix bigint;
UPDATE user_profile SET updated_at_posix = EXTRACT(EPOCH FROM NOW())::bigint;
ALTER TABLE user_profile ALTER COLUMN updated_at_posix SET NOT NULL;



-- migrate:down

ALTER TABLE user_profile DROP COLUMN created_at_posix;
ALTER TABLE user_profile DROP COLUMN updated_at_posix;
ALTER TABLE user_profile DROP COLUMN user_id;
