-- migrate:up

ALTER TABLE user_profile DROP COLUMN avatar_url;

-- migrate:down

ALTER TABLE user_profile ADD COLUMN avatar_url TEXT;

