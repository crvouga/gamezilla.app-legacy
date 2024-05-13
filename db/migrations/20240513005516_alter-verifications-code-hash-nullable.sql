-- migrate:up

ALTER TABLE auth_sms_verification ALTER COLUMN code_hash DROP NOT NULL;

-- migrate:down

ALTER TABLE auth_sms_verification ALTER COLUMN code_hash SET NOT NULL;
