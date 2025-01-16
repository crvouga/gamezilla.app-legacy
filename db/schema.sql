SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: powersync; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA powersync;


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'super',
    'normal',
    'guest'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bucket_data; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.bucket_data (
    group_id integer NOT NULL,
    bucket_name text NOT NULL,
    op_id bigint NOT NULL,
    op text NOT NULL,
    source_table text,
    source_key bytea,
    table_name text,
    row_id text,
    checksum bigint NOT NULL,
    data text,
    target_op bigint
);


--
-- Name: op_id_sequence; Type: SEQUENCE; Schema: powersync; Owner: -
--

CREATE SEQUENCE powersync.op_id_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bucket_parameters; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.bucket_parameters (
    id bigint DEFAULT nextval('powersync.op_id_sequence'::regclass) NOT NULL,
    group_id integer NOT NULL,
    source_table text NOT NULL,
    source_key bytea NOT NULL,
    lookup bytea NOT NULL,
    bucket_parameters text NOT NULL
);


--
-- Name: current_data; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.current_data (
    group_id integer NOT NULL,
    source_table text NOT NULL,
    source_key bytea NOT NULL,
    buckets jsonb NOT NULL,
    data bytea NOT NULL,
    lookups bytea[] NOT NULL
);


--
-- Name: custom_write_checkpoints; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.custom_write_checkpoints (
    user_id text NOT NULL,
    write_checkpoint bigint NOT NULL,
    sync_rules_id integer NOT NULL
);


--
-- Name: instance; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.instance (
    id text NOT NULL
);


--
-- Name: locks; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.locks (
    name text NOT NULL,
    lock_id uuid NOT NULL,
    ts timestamp with time zone NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.migrations (
    id integer NOT NULL,
    last_run text,
    log jsonb NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: powersync; Owner: -
--

CREATE SEQUENCE powersync.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: powersync; Owner: -
--

ALTER SEQUENCE powersync.migrations_id_seq OWNED BY powersync.migrations.id;


--
-- Name: source_tables; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.source_tables (
    id text NOT NULL,
    group_id integer NOT NULL,
    connection_id integer NOT NULL,
    relation_id jsonb,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    replica_id_columns jsonb,
    snapshot_done boolean DEFAULT false NOT NULL
);


--
-- Name: sync_rules; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.sync_rules (
    id integer NOT NULL,
    state text NOT NULL,
    snapshot_done boolean DEFAULT false NOT NULL,
    last_checkpoint bigint,
    last_checkpoint_lsn text,
    no_checkpoint_before text,
    slot_name text,
    last_checkpoint_ts timestamp with time zone,
    last_keepalive_ts timestamp with time zone,
    keepalive_op bigint,
    last_fatal_error text,
    content text NOT NULL
);


--
-- Name: sync_rules_id_sequence; Type: SEQUENCE; Schema: powersync; Owner: -
--

CREATE SEQUENCE powersync.sync_rules_id_sequence
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: write_checkpoints; Type: TABLE; Schema: powersync; Owner: -
--

CREATE TABLE powersync.write_checkpoints (
    user_id text NOT NULL,
    lsns jsonb NOT NULL,
    write_checkpoint bigint NOT NULL
);


--
-- Name: auth_sms_verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_sms_verification (
    verification_id text NOT NULL,
    code_hash json,
    phone_number text NOT NULL,
    created_at_posix bigint NOT NULL,
    expires_at_posix bigint NOT NULL,
    verified_at_posix bigint
);


--
-- Name: auth_sms_verification_attempt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_sms_verification_attempt (
    verification_attempt_id text NOT NULL,
    verification_id text NOT NULL,
    inputted_code_hash json NOT NULL,
    created_at_posix bigint NOT NULL
);


--
-- Name: game_chess_puzzle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_chess_puzzle (
    puzzle_id text NOT NULL,
    rating integer,
    rating_deviation integer,
    opening_tags text NOT NULL,
    fen text,
    moves text NOT NULL,
    popularity integer,
    number_of_plays integer,
    themes text NOT NULL,
    game_url text
);


--
-- Name: game_chess_puzzle_interaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_chess_puzzle_interaction (
    id integer NOT NULL,
    puzzle_id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    CONSTRAINT game_chess_puzzle_interaction_type_check CHECK ((type = ANY (ARRAY['solved'::text, 'incorrect'::text, 'solved-with-hint'::text, 'started'::text])))
);


--
-- Name: game_chess_puzzle_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_chess_puzzle_profile (
    id text NOT NULL,
    user_id text NOT NULL,
    puzzle_query text NOT NULL,
    elo_rating integer NOT NULL
);


--
-- Name: game_flow_pack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_flow_pack (
    flow_pack_id text NOT NULL,
    flow_pack_name text NOT NULL,
    flow_puzzle_ids text[] NOT NULL,
    created_at_posix bigint NOT NULL,
    created_by_user_id text NOT NULL,
    last_updated_at_posix bigint NOT NULL,
    last_updated_by_user_id text NOT NULL,
    deleted_at_posix bigint,
    deleted_by_user_id text
);


--
-- Name: game_flow_puzzle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_flow_puzzle (
    flow_puzzle_id text NOT NULL,
    flow_puzzle_name text NOT NULL,
    flow json NOT NULL,
    created_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL,
    created_by_user_id text NOT NULL,
    last_updated_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL,
    last_updated_by_user_id text NOT NULL,
    deleted_at bigint,
    deleted_by_user_id text,
    flow_solutions jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: game_flow_solutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_flow_solutions (
    flow_hash text NOT NULL,
    solutions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL,
    last_updated_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL
);


--
-- Name: key_value; Type: TABLE; Schema: public; Owner: -
--

CREATE UNLOGGED TABLE public.key_value (
    key text NOT NULL,
    value text
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: user_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_account (
    user_id text NOT NULL,
    created_at_posix bigint NOT NULL,
    user_role public.user_role NOT NULL,
    phone_number text
);


--
-- Name: user_guest_session_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_guest_session_mapping (
    user_id text NOT NULL,
    session_id text NOT NULL,
    created_at_posix bigint NOT NULL
);


--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profile (
    user_id text NOT NULL,
    username text NOT NULL,
    avatar_seed text,
    avatar_style text
);


--
-- Name: user_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_session (
    user_session_id text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at timestamp with time zone,
    session_id text
);


--
-- Name: migrations id; Type: DEFAULT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.migrations ALTER COLUMN id SET DEFAULT nextval('powersync.migrations_id_seq'::regclass);


--
-- Name: bucket_parameters bucket_parameters_pkey; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.bucket_parameters
    ADD CONSTRAINT bucket_parameters_pkey PRIMARY KEY (id);


--
-- Name: instance instance_pkey; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.instance
    ADD CONSTRAINT instance_pkey PRIMARY KEY (id);


--
-- Name: locks locks_pkey; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.locks
    ADD CONSTRAINT locks_pkey PRIMARY KEY (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: source_tables source_tables_pkey; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.source_tables
    ADD CONSTRAINT source_tables_pkey PRIMARY KEY (id);


--
-- Name: sync_rules sync_rules_pkey; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.sync_rules
    ADD CONSTRAINT sync_rules_pkey PRIMARY KEY (id);


--
-- Name: current_data unique_current_data_id; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.current_data
    ADD CONSTRAINT unique_current_data_id PRIMARY KEY (group_id, source_table, source_key);


--
-- Name: bucket_data unique_id; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.bucket_data
    ADD CONSTRAINT unique_id PRIMARY KEY (group_id, bucket_name, op_id);


--
-- Name: custom_write_checkpoints unique_user_sync; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.custom_write_checkpoints
    ADD CONSTRAINT unique_user_sync PRIMARY KEY (user_id, sync_rules_id);


--
-- Name: write_checkpoints write_checkpoints_pkey; Type: CONSTRAINT; Schema: powersync; Owner: -
--

ALTER TABLE ONLY powersync.write_checkpoints
    ADD CONSTRAINT write_checkpoints_pkey PRIMARY KEY (user_id);


--
-- Name: auth_sms_verification_attempt auth_sms_verification_attempt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sms_verification_attempt
    ADD CONSTRAINT auth_sms_verification_attempt_pkey PRIMARY KEY (verification_attempt_id);


--
-- Name: auth_sms_verification auth_sms_verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sms_verification
    ADD CONSTRAINT auth_sms_verification_pkey PRIMARY KEY (verification_id);


--
-- Name: game_chess_puzzle_interaction game_chess_puzzle_interaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_chess_puzzle_interaction
    ADD CONSTRAINT game_chess_puzzle_interaction_pkey PRIMARY KEY (id);


--
-- Name: game_chess_puzzle game_chess_puzzle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_chess_puzzle
    ADD CONSTRAINT game_chess_puzzle_pkey PRIMARY KEY (puzzle_id);


--
-- Name: game_chess_puzzle_profile game_chess_puzzle_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_chess_puzzle_profile
    ADD CONSTRAINT game_chess_puzzle_profile_pkey PRIMARY KEY (id);


--
-- Name: game_flow_pack game_flow_pack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_flow_pack
    ADD CONSTRAINT game_flow_pack_pkey PRIMARY KEY (flow_pack_id);


--
-- Name: game_flow_puzzle game_flow_puzzle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_flow_puzzle
    ADD CONSTRAINT game_flow_puzzle_pkey PRIMARY KEY (flow_puzzle_id);


--
-- Name: game_flow_solutions game_flow_solutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_flow_solutions
    ADD CONSTRAINT game_flow_solutions_pkey PRIMARY KEY (flow_hash);


--
-- Name: key_value key_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.key_value
    ADD CONSTRAINT key_value_pkey PRIMARY KEY (key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (user_id);


--
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (user_id);


--
-- Name: user_profile user_profile_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_username_key UNIQUE (username);


--
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (user_session_id);


--
-- Name: bucket_parameters_lookup_index; Type: INDEX; Schema: powersync; Owner: -
--

CREATE INDEX bucket_parameters_lookup_index ON powersync.bucket_parameters USING btree (group_id, lookup, id DESC);


--
-- Name: bucket_parameters_source_index; Type: INDEX; Schema: powersync; Owner: -
--

CREATE INDEX bucket_parameters_source_index ON powersync.bucket_parameters USING btree (group_id, source_table, source_key);


--
-- Name: source_table_lookup; Type: INDEX; Schema: powersync; Owner: -
--

CREATE INDEX source_table_lookup ON powersync.source_tables USING btree (group_id, table_name);


--
-- Name: game_chess_puzzle_interaction_puzzle_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_chess_puzzle_interaction_puzzle_id_idx ON public.game_chess_puzzle_interaction USING btree (puzzle_id);


--
-- Name: game_chess_puzzle_interaction_puzzle_id_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_chess_puzzle_interaction_puzzle_id_user_id_idx ON public.game_chess_puzzle_interaction USING btree (puzzle_id, user_id);


--
-- Name: idx_game_chess_puzzle_popularity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_game_chess_puzzle_popularity ON public.game_chess_puzzle USING btree (popularity);


--
-- Name: idx_game_chess_puzzle_profile_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_game_chess_puzzle_profile_user_id ON public.game_chess_puzzle_profile USING btree (user_id);


--
-- Name: idx_game_chess_puzzle_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_game_chess_puzzle_rating ON public.game_chess_puzzle USING btree (rating);


--
-- Name: idx_user_guest_session_mapping_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_guest_session_mapping_session_id ON public.user_guest_session_mapping USING btree (session_id);


--
-- Name: idx_user_guest_session_mapping_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_guest_session_mapping_user_id ON public.user_guest_session_mapping USING btree (user_id);


--
-- Name: idx_user_session_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_session_created_at ON public.user_session USING btree (created_at);


--
-- Name: idx_user_session_session_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_session_session_id_created_at ON public.user_session USING btree (user_session_id, created_at);


--
-- Name: idx_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_username ON public.user_profile USING btree (username);


--
-- Name: electric_publication_default; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION electric_publication_default WITH (publish = 'insert, update, delete, truncate');


--
-- Name: powersync; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION powersync FOR ALL TABLES WITH (publish = 'insert, update, delete, truncate');


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20231111232244'),
    ('20231112003940'),
    ('20231112220209'),
    ('20231113081720'),
    ('20231115190935'),
    ('20231116190003'),
    ('20231116191553'),
    ('20231116192910'),
    ('20240116044515'),
    ('20240129215712'),
    ('20240203025639'),
    ('20240203034127'),
    ('20240203034632'),
    ('20240203034900'),
    ('20240203035440'),
    ('20240203040136'),
    ('20240203045837'),
    ('20240214195501'),
    ('20240214202304'),
    ('20240405231549'),
    ('20240410213113'),
    ('20240410223252'),
    ('20240428015435'),
    ('20240501070923'),
    ('20240508205504'),
    ('20240508214804'),
    ('20240510025350'),
    ('20240512033531'),
    ('20240513005516'),
    ('20240519212003'),
    ('20240519212517'),
    ('20240530071956'),
    ('20240630071855'),
    ('20250110223606');
