-- migrate:up


CREATE TYPE user_role AS ENUM ('super', 'normal', 'guest');

ALTER TABLE user_account ADD COLUMN user_role user_role;

UPDATE user_account 
SET user_role = 'normal' 
WHERE phone_number IS NOT NULL OR email_address IS NOT NULL;

UPDATE user_account 
SET user_role = 'guest' 
WHERE user_role IS NULL;

ALTER TABLE user_account ALTER COLUMN user_role SET NOT NULL;


ALTER TABLE user_account ADD CONSTRAINT non_guest_users_must_have_email_address_or_phone_number CHECK (
    (user_role::text = 'guest') OR (email_address IS NOT NULL OR phone_number IS NOT NULL)
);

-- migrate:down

ALTER TABLE user_account DROP CONSTRAINT non_guest_users_must_have_email_address_or_phone_number;

ALTER TABLE user_account DROP COLUMN user_role;

DROP TYPE user_role;




