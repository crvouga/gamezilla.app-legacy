-- migrate:up


-- Remove the default constraints before altering the type
ALTER TABLE public.game_flow_puzzle
  ALTER COLUMN created_at DROP DEFAULT,
  ALTER COLUMN last_updated_at DROP DEFAULT;

-- Convert and alter the timestamp columns to bigint
ALTER TABLE public.game_flow_puzzle
  ALTER COLUMN created_at TYPE bigint USING (EXTRACT(EPOCH FROM created_at) * 1000)::bigint,
  ALTER COLUMN last_updated_at TYPE bigint USING (EXTRACT(EPOCH FROM last_updated_at) * 1000)::bigint,
  ALTER COLUMN deleted_at TYPE bigint USING (EXTRACT(EPOCH FROM deleted_at) * 1000)::bigint;

-- Set new default values as current Unix timestamp in milliseconds
ALTER TABLE public.game_flow_puzzle
  ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000)::bigint,
  ALTER COLUMN last_updated_at SET DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000)::bigint;



-- migrate:down


-- Drop existing defaults to avoid type conflicts
ALTER TABLE public.game_flow_puzzle
  ALTER COLUMN created_at DROP DEFAULT,
  ALTER COLUMN last_updated_at DROP DEFAULT;

-- Convert bigint back to timestamp without time zone
ALTER TABLE public.game_flow_puzzle
  ALTER COLUMN created_at TYPE timestamp without time zone USING TO_TIMESTAMP(created_at / 1000.0),
  ALTER COLUMN last_updated_at TYPE timestamp without time zone USING TO_TIMESTAMP(last_updated_at / 1000.0),
  ALTER COLUMN deleted_at TYPE timestamp without time zone USING TO_TIMESTAMP(deleted_at / 1000.0);

-- Now, set the default values back to CURRENT_TIMESTAMP for the timestamp columns
ALTER TABLE public.game_flow_puzzle
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN last_updated_at SET DEFAULT CURRENT_TIMESTAMP;

