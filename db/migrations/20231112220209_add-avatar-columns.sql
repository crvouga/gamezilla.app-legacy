-- migrate:up

ALTER TABLE user_profile ADD COLUMN avatar_seed TEXT;
ALTER TABLE user_profile ADD COLUMN avatar_style TEXT;

-- migrate:down

ALTER TABLE user_profile DROP COLUMN avatar_seed;
ALTER TABLE user_profile DROP COLUMN avatar_style;
