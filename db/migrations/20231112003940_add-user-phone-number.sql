-- migrate:up

ALTER TABLE user_account ADD COLUMN phone_number TEXT;

-- migrate:down

ALTER TABLE user_account DROP COLUMN phone_number;
