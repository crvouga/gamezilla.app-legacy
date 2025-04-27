-- migrate:up

ALTER TABLE user_guest_session_mapping REPLICA IDENTITY FULL;

ALTER TABLE user_guest_session_mapping RENAME COLUMN id TO guest_user_id;

ALTER TABLE user_guest_session_mapping ADD COLUMN id TEXT;

UPDATE user_guest_session_mapping SET id = gen_random_uuid()::text;

ALTER TABLE user_guest_session_mapping ALTER COLUMN id SET NOT NULL;

ALTER TABLE user_guest_session_mapping ADD PRIMARY KEY (id);

-- migrate:down

ALTER TABLE user_guest_session_mapping DROP CONSTRAINT user_guest_session_mapping_pkey;

ALTER TABLE user_guest_session_mapping DROP COLUMN id;

ALTER TABLE user_guest_session_mapping RENAME COLUMN guest_user_id TO id;

ALTER TABLE user_guest_session_mapping REPLICA IDENTITY DEFAULT;
