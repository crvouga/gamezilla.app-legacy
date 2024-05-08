-- migrate:up

ALTER TABLE user_account ALTER COLUMN created_at TYPE bigint USING EXTRACT(EPOCH FROM created_at)::bigint;

ALTER TABLE user_account RENAME COLUMN created_at TO created_at_posix;

-- migrate:down

ALTER TABLE user_account RENAME COLUMN created_at_posix TO created_at;

ALTER TABLE user_account ALTER COLUMN created_at TYPE timestamp with time zone USING to_timestamp(created_at);
