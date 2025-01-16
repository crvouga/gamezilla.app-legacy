-- migrate:up
ALTER TABLE auth_sms_verification RENAME COLUMN verification_id TO id;

ALTER TABLE auth_sms_verification_attempt RENAME COLUMN verification_attempt_id TO id;

ALTER TABLE game_chess_puzzle RENAME COLUMN puzzle_id TO id;

-- ALTER TABLE game_chess_puzzle_interaction RENAME COLUMN id TO id;

-- ALTER TABLE game_chess_puzzle_profile RENAME COLUMN id TO id;

ALTER TABLE game_flow_pack RENAME COLUMN flow_pack_id TO id;

ALTER TABLE game_flow_puzzle RENAME COLUMN flow_puzzle_id TO id;

ALTER TABLE game_flow_solutions RENAME COLUMN flow_hash TO id;

ALTER TABLE key_value RENAME COLUMN key TO id;

ALTER TABLE user_account RENAME COLUMN user_id TO id;

ALTER TABLE user_guest_session_mapping RENAME COLUMN user_id TO id;

ALTER TABLE user_profile RENAME COLUMN user_id TO id;

ALTER TABLE user_session RENAME COLUMN user_session_id TO id;

-- migrate:down

ALTER TABLE auth_sms_verification RENAME COLUMN id TO verification_id;

ALTER TABLE auth_sms_verification_attempt RENAME COLUMN id TO verification_attempt_id;

ALTER TABLE game_chess_puzzle RENAME COLUMN id TO puzzle_id;

-- ALTER TABLE game_chess_puzzle_interaction RENAME COLUMN id TO id;

-- ALTER TABLE game_chess_puzzle_profile RENAME COLUMN id TO id;

ALTER TABLE game_flow_pack RENAME COLUMN id TO flow_pack_id;

ALTER TABLE game_flow_puzzle RENAME COLUMN id TO flow_puzzle_id;

ALTER TABLE game_flow_solutions RENAME COLUMN id TO flow_hash;

ALTER TABLE key_value RENAME COLUMN id TO key;

ALTER TABLE user_account RENAME COLUMN id TO user_id;

ALTER TABLE user_guest_session_mapping RENAME COLUMN id TO user_id;

ALTER TABLE user_profile RENAME COLUMN id TO user_id;

ALTER TABLE user_session RENAME COLUMN id TO user_session_id;
