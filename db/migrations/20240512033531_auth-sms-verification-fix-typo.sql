-- migrate:up

ALTER TABLE auth_sms_verification_attempt RENAME COLUMN verificationid TO verification_id;

-- migrate:down

ALTER TABLE auth_sms_verification_attempt RENAME COLUMN verification_id TO verificationid;