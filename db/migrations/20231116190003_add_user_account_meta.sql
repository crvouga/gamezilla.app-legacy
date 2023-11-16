-- migrate:up

ALTER TABLE user_account ADD COLUMN created_at TIMESTAMP;
ALTER TABLE user_account ADD COLUMN last_logged_in_at TIMESTAMP;

-- migrate:down

ALTER TABLE user_account DROP COLUMN created_at;
ALTER TABLE user_account DROP COLUMN last_logged_in_at;

