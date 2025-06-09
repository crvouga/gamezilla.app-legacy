-- migrate:up

ALTER TABLE auth_sms_verification RENAME COLUMN created_at_posix TO created_at_unix_ms;
ALTER TABLE auth_sms_verification RENAME COLUMN expires_at_posix TO expires_at_unix_ms;
ALTER TABLE auth_sms_verification RENAME COLUMN verified_at_posix TO verified_at_unix_ms;

ALTER TABLE auth_sms_verification_attempt RENAME COLUMN created_at_posix TO created_at_unix_ms;

ALTER TABLE game_flow_pack RENAME COLUMN created_at_posix TO created_at_unix_ms;
ALTER TABLE game_flow_pack RENAME COLUMN last_updated_at_posix TO last_updated_at_unix_ms;
ALTER TABLE game_flow_pack RENAME COLUMN deleted_at_posix TO deleted_at_unix_ms;

ALTER TABLE game_flow_pack_item RENAME COLUMN created_at_posix TO created_at_unix_ms;
ALTER TABLE game_flow_pack_item RENAME COLUMN deleted_at_posix TO deleted_at_unix_ms;

ALTER TABLE game_flow_puzzle RENAME COLUMN created_at_posix TO created_at_unix_ms;
ALTER TABLE game_flow_puzzle RENAME COLUMN last_updated_at_posix TO last_updated_at_unix_ms;
ALTER TABLE game_flow_puzzle RENAME COLUMN deleted_at_posix TO deleted_at_unix_ms;

ALTER TABLE game_flow_solutions RENAME COLUMN created_at_posix TO created_at_unix_ms;
ALTER TABLE game_flow_solutions RENAME COLUMN last_updated_at_posix TO last_updated_at_unix_ms;

ALTER TABLE user_account RENAME COLUMN created_at_posix TO created_at_unix_ms;

ALTER TABLE user_guest_session_mapping RENAME COLUMN created_at_posix TO created_at_unix_ms;

ALTER TABLE user_profile RENAME COLUMN created_at_posix TO created_at_unix_ms;
ALTER TABLE user_profile RENAME COLUMN updated_at_posix TO updated_at_unix_ms;

ALTER TABLE user_session RENAME COLUMN created_at_posix TO created_at_unix_ms;
ALTER TABLE user_session RENAME COLUMN ended_at_posix TO ended_at_unix_ms;

-- migrate:down

ALTER TABLE auth_sms_verification RENAME COLUMN created_at_unix_ms TO created_at_posix;
ALTER TABLE auth_sms_verification RENAME COLUMN expires_at_unix_ms TO expires_at_posix;
ALTER TABLE auth_sms_verification RENAME COLUMN verified_at_unix_ms TO verified_at_posix;

ALTER TABLE auth_sms_verification_attempt RENAME COLUMN created_at_unix_ms TO created_at_posix;

ALTER TABLE game_flow_pack RENAME COLUMN created_at_unix_ms TO created_at_posix;
ALTER TABLE game_flow_pack RENAME COLUMN last_updated_at_unix_ms TO last_updated_at_posix;
ALTER TABLE game_flow_pack RENAME COLUMN deleted_at_unix_ms TO deleted_at_posix;

ALTER TABLE game_flow_pack_item RENAME COLUMN created_at_unix_ms TO created_at_posix;
ALTER TABLE game_flow_pack_item RENAME COLUMN deleted_at_unix_ms TO deleted_at_posix;

ALTER TABLE game_flow_puzzle RENAME COLUMN created_at_unix_ms TO created_at_posix;
ALTER TABLE game_flow_puzzle RENAME COLUMN last_updated_at_unix_ms TO last_updated_at_posix;
ALTER TABLE game_flow_puzzle RENAME COLUMN deleted_at_unix_ms TO deleted_at_posix;

ALTER TABLE game_flow_solutions RENAME COLUMN created_at_unix_ms TO created_at_posix;
ALTER TABLE game_flow_solutions RENAME COLUMN last_updated_at_unix_ms TO last_updated_at_posix;

ALTER TABLE user_account RENAME COLUMN created_at_unix_ms TO created_at_posix;

ALTER TABLE user_guest_session_mapping RENAME COLUMN created_at_unix_ms TO created_at_posix;

ALTER TABLE user_profile RENAME COLUMN created_at_unix_ms TO created_at_posix;
ALTER TABLE user_profile RENAME COLUMN updated_at_unix_ms TO updated_at_posix;

ALTER TABLE user_session RENAME COLUMN created_at_unix_ms TO created_at_posix;
ALTER TABLE user_session RENAME COLUMN ended_at_unix_ms TO ended_at_posix;
