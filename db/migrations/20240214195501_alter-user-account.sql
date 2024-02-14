-- migrate:up

UPDATE user_account SET created_at = NOW() WHERE created_at IS NULL;

ALTER TABLE user_account 
    DROP COLUMN last_logged_in_at,
    ALTER COLUMN created_at SET NOT NULL;

-- migrate:down

ALTER TABLE user_account 
    ADD COLUMN last_logged_in_at TIMESTAMP,
    ALTER COLUMN created_at DROP NOT NULL;

