-- migrate:up

DROP TABLE user_account_phone_number;

-- migrate:down


CREATE TABLE public.user_account_phone_number (
    user_id text NOT NULL,
    phone_number_hash jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL
);


