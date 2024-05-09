-- migrate:up



CREATE TABLE auth_sms_verification (
    verification_id TEXT PRIMARY KEY,
	code_hash JSON NOT NULL,
    phone_number TEXT NOT NULL,
    created_at_posix BIGINT NOT NULL,
    expires_in_milliseconds BIGINT NOT NULL,
    verified_at_posix BIGINT
);

CREATE TABLE auth_sms_verification_attempt (
    verification_attempt_id TEXT PRIMARY KEY,
	verificationId TEXT NOT NULL,
    inputted_code_hash JSON NOT NULL,
    created_at_posix BIGINT NOT NULL
);


-- migrate:down


DROP TABLE auth_sms_verification_attempt;
DROP TABLE auth_sms_verification;
