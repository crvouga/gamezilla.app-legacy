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
-- Name: game_flow_puzzle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_flow_puzzle (
    flow_puzzle_id text NOT NULL,
    flow_puzzle_name text NOT NULL,
    flow_puzzle json NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by_user_id text NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by_user_id text,
    last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated_by_user_id text NOT NULL
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
    email_address text,
    phone_number text,
    created_at timestamp without time zone NOT NULL,
    user_role public.user_role NOT NULL,
    CONSTRAINT non_guest_users_must_have_email_address_or_phone_number CHECK ((((user_role)::text = 'guest'::text) OR ((email_address IS NOT NULL) OR (phone_number IS NOT NULL))))
);


--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profile (
    user_id character varying(255) NOT NULL,
    username character varying(255) DEFAULT NULL::character varying,
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
-- Name: game_flow_puzzle game_flow_puzzle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_flow_puzzle
    ADD CONSTRAINT game_flow_puzzle_pkey PRIMARY KEY (flow_puzzle_id);


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
-- Name: user_account user_account_email_address_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_email_address_key UNIQUE (email_address);


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
    ('20240203034815'),
    ('20240203034900'),
    ('20240203035440'),
    ('20240203040136'),
    ('20240203045837'),
    ('20240214195501'),
    ('20240214202304'),
    ('20240405231549');
