
SELECT * FROM immutable_store;

SELECT COUNT(*) FROM immutable_store;

DELETE FROM user_profile WHERE user_profile.user_id IS NULL;
DELETE FROM user_account WHERE user_account.user_id IS NULL;

SELECT * FROM user_profile;

SELECT * FROM user_account
LEFT JOIN user_profile
ON user_account.user_id = user_profile.user_id;
