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
-- Name: playing_with_neon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playing_with_neon (
    id integer NOT NULL,
    name text NOT NULL,
    value real
);


--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.playing_with_neon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.playing_with_neon_id_seq OWNED BY public.playing_with_neon.id;


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
    phone_number text
);


--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profile (
    user_id character varying(255) NOT NULL,
    avatar_url character varying(255) DEFAULT NULL::character varying,
    username character varying(255) DEFAULT NULL::character varying
);


--
-- Name: playing_with_neon id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playing_with_neon ALTER COLUMN id SET DEFAULT nextval('public.playing_with_neon_id_seq'::regclass);


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
-- Name: playing_with_neon playing_with_neon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playing_with_neon
    ADD CONSTRAINT playing_with_neon_pkey PRIMARY KEY (id);


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
    ('20231112003940');
