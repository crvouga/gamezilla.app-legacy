-- migrate:up

ALTER TABLE user_account
DROP COLUMN email_address,
DROP COLUMN phone_number,
ALTER COLUMN created_at TYPE timestamp with time zone USING created_at AT TIME ZONE 'UTC';

-- migrate:down

ALTER TABLE user_account
ADD COLUMN email_address TEXT,
ADD COLUMN phone_number TEXT,
ALTER COLUMN created_at TYPE timestamp without time zone USING created_at AT TIME ZONE 'UTC';



