-- migrate:up

ALTER TABLE public.game_numberlink_puzzle RENAME COLUMN flow TO model;

-- migrate:down

ALTER TABLE public.game_numberlink_puzzle RENAME COLUMN model TO flow;