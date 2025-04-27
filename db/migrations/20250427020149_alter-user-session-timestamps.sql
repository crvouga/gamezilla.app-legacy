-- migrate:up
ALTER TABLE public.user_session
  ADD COLUMN created_at_posix bigint,
  ADD COLUMN ended_at_posix bigint;

-- Update the new columns with converted timestamp values
UPDATE public.user_session
SET created_at_posix = EXTRACT(EPOCH FROM created_at)::bigint * 1000,
    ended_at_posix = EXTRACT(EPOCH FROM ended_at)::bigint * 1000;

-- Make created_at_posix NOT NULL after populating data
ALTER TABLE public.user_session
  ALTER COLUMN created_at_posix SET NOT NULL;

-- Drop the old timestamp columns
ALTER TABLE public.user_session
  DROP COLUMN created_at,
  DROP COLUMN ended_at;

-- migrate:down
ALTER TABLE public.user_session
  ADD COLUMN created_at timestamp without time zone,
  ADD COLUMN ended_at timestamp with time zone;

-- Convert posix timestamps back to regular timestamps
UPDATE public.user_session
SET created_at = to_timestamp(created_at_posix / 1000),
    ended_at = to_timestamp(ended_at_posix / 1000) AT TIME ZONE 'UTC';

-- Restore the NOT NULL constraint and default value
ALTER TABLE public.user_session
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- Drop the posix columns
ALTER TABLE public.user_session
  DROP COLUMN created_at_posix,
  DROP COLUMN ended_at_posix;
