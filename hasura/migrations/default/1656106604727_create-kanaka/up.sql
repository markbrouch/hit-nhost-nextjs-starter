
CREATE TABLE public.kanaka (
    kanaka_id integer NOT NULL,
    owner_id uuid NULL, -- nhost user_id
    name text,
    formal_name text,
    xref_id text,
    sex character varying(1), -- K|W or M|F
    _uid text,
    name_surname text,
    name_aka text,
    birth_date text,
    birth_date_dt date,
    birth_place text,
    family_spouse jsonb,
    family_child jsonb,
    residence text,
    residence_place text,
    burial_place text,
    change_date timestamp(0) with time zone,
    source_uid text,
    create_timestamp timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.kanaka_id_seq
    AS integer
    START WITH 101
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.kanaka
    ADD CONSTRAINT kanaka_pk PRIMARY KEY (kanaka_id);

ALTER TABLE ONLY public.kanaka ALTER COLUMN kanaka_id SET DEFAULT nextval('public.kanaka_id_seq'::regclass);

