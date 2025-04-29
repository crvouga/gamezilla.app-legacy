-- migrate:up

ALTER TABLE user_profile REPLICA IDENTITY FULL;

DELETE FROM user_profile
WHERE user_id IN (
    SELECT user_id
    FROM (
        SELECT user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at_posix DESC) as row_num
        FROM user_profile
    ) t
    WHERE t.row_num > 1
);

ALTER TABLE user_profile ADD COLUMN temp_id text;
UPDATE user_profile SET temp_id = id;

ALTER TABLE user_profile DROP CONSTRAINT IF EXISTS user_profile_pkey;

UPDATE user_profile SET id = user_id;

ALTER TABLE user_profile DROP COLUMN user_id;

ALTER TABLE user_profile ADD PRIMARY KEY (id);

ALTER TABLE user_profile DROP COLUMN temp_id;


-- migrate:down

ALTER TABLE user_profile REPLICA IDENTITY FULL;

ALTER TABLE user_profile ADD COLUMN user_id text;

UPDATE user_profile SET user_id = id;

ALTER TABLE user_profile ADD COLUMN temp_id text;

ALTER TABLE user_profile DROP CONSTRAINT user_profile_pkey;

ALTER TABLE user_profile DROP COLUMN temp_id;
