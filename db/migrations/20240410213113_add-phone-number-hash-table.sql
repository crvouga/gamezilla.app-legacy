-- migrate:up

CREATE TABLE user_account_phone_number (
    user_id text NOT NULL,
    phone_number_hash jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL,
    CONSTRAINT fk_user_account FOREIGN KEY (user_id) 
        REFERENCES public.user_account (user_id) 
        ON DELETE CASCADE
);

-- migrate:down


DROP TABLE user_account_phone_number;