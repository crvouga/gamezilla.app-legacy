-- migrate:up


ALTER TABLE user_session RENAME session_id TO user_session_id;


-- migrate:down

ALTER TABLE user_session RENAME user_session_id TO session_id;


