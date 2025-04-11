SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

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
-- Name: auth_sms_verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_sms_verification (
    id text NOT NULL,
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
    id text NOT NULL,
    verification_id text NOT NULL,
    inputted_code_hash json NOT NULL,
    created_at_posix bigint NOT NULL
);


--
-- Name: game_chess_puzzle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_chess_puzzle (
    id text NOT NULL,
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
    id text NOT NULL,
    flow_pack_name text NOT NULL,
    created_at_posix bigint NOT NULL,
    created_by_user_id text NOT NULL,
    last_updated_at_posix bigint NOT NULL,
    last_updated_by_user_id text NOT NULL,
    deleted_at_posix bigint,
    deleted_by_user_id text
);


--
-- Name: game_flow_pack_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_flow_pack_item (
    id text NOT NULL,
    pack_id text NOT NULL,
    puzzle_id text NOT NULL,
    "position" bigint NOT NULL,
    created_at_posix bigint NOT NULL,
    created_by_user_id text NOT NULL,
    deleted_at_posix bigint,
    deleted_by_user_id text
);


--
-- Name: game_flow_puzzle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_flow_puzzle (
    id text NOT NULL,
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
    id text NOT NULL,
    solutions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL,
    last_updated_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL
);


--
-- Name: key_value; Type: TABLE; Schema: public; Owner: -
--

CREATE UNLOGGED TABLE public.key_value (
    id text NOT NULL,
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
    id text NOT NULL,
    created_at_posix bigint NOT NULL,
    user_role public.user_role NOT NULL,
    phone_number text
);


--
-- Name: user_guest_session_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_guest_session_mapping (
    id text NOT NULL,
    session_id text NOT NULL,
    created_at_posix bigint NOT NULL
);


--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profile (
    id text NOT NULL,
    username text NOT NULL,
    avatar_seed text,
    avatar_style text
);


--
-- Name: user_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_session (
    id text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at timestamp with time zone,
    session_id text
);


--
-- Name: auth_sms_verification_attempt auth_sms_verification_attempt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sms_verification_attempt
    ADD CONSTRAINT auth_sms_verification_attempt_pkey PRIMARY KEY (id);


--
-- Name: auth_sms_verification auth_sms_verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sms_verification
    ADD CONSTRAINT auth_sms_verification_pkey PRIMARY KEY (id);


--
-- Name: game_chess_puzzle_interaction game_chess_puzzle_interaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_chess_puzzle_interaction
    ADD CONSTRAINT game_chess_puzzle_interaction_pkey PRIMARY KEY (id);


--
-- Name: game_chess_puzzle game_chess_puzzle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_chess_puzzle
    ADD CONSTRAINT game_chess_puzzle_pkey PRIMARY KEY (id);


--
-- Name: game_chess_puzzle_profile game_chess_puzzle_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_chess_puzzle_profile
    ADD CONSTRAINT game_chess_puzzle_profile_pkey PRIMARY KEY (id);


--
-- Name: game_flow_pack_item game_flow_pack_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_flow_pack_item
    ADD CONSTRAINT game_flow_pack_item_pkey PRIMARY KEY (id);


--
-- Name: game_flow_pack game_flow_pack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_flow_pack
    ADD CONSTRAINT game_flow_pack_pkey PRIMARY KEY (id);


--
-- Name: game_flow_puzzle game_flow_puzzle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_flow_puzzle
    ADD CONSTRAINT game_flow_puzzle_pkey PRIMARY KEY (id);


--
-- Name: game_flow_solutions game_flow_solutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_flow_solutions
    ADD CONSTRAINT game_flow_solutions_pkey PRIMARY KEY (id);


--
-- Name: key_value key_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.key_value
    ADD CONSTRAINT key_value_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (id);


--
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- Name: user_profile user_profile_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_username_key UNIQUE (username);


--
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (id);


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
-- Name: idx_game_flow_pack_item_pack_id_not_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_game_flow_pack_item_pack_id_not_deleted ON public.game_flow_pack_item USING btree (pack_id) WHERE (deleted_at_posix IS NULL);


--
-- Name: idx_user_guest_session_mapping_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_guest_session_mapping_session_id ON public.user_guest_session_mapping USING btree (session_id);


--
-- Name: idx_user_guest_session_mapping_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_guest_session_mapping_user_id ON public.user_guest_session_mapping USING btree (id);


--
-- Name: idx_user_session_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_session_created_at ON public.user_session USING btree (created_at);


--
-- Name: idx_user_session_session_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_session_session_id_created_at ON public.user_session USING btree (id, created_at);


--
-- Name: idx_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_username ON public.user_profile USING btree (username);


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
    ('20250110223606'),
    ('20250116191615'),
    ('20250117215818');
