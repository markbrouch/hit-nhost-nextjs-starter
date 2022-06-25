
CREATE TABLE public.ohana (
    ohana_id integer NOT NULL,
    owner_id uuid NULL, -- nhost user_id
    formal_name text,
    xref_id text,
    -- kane text,
    kane_id integer NULL, -- kanaka_id
    -- wahine text,
    wahine_id integer NULL, -- kanaka_id
    -- kamalii jsonb,
    marriage_date text,
    marriage_date_dt date,
    marriage_place text,
    birth_place text,
    -- family_spouse jsonb,
    -- family_child jsonb,
    residence text,
    residence_place text,
    burial_place text,
    change_date timestamp(0) with time zone,
    source_uid text,
    create_timestamp timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.ohana_id_seq
    AS integer
    START WITH 101
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.ohana ALTER COLUMN ohana_id SET DEFAULT nextval('public.ohana_id_seq'::regclass);

ALTER TABLE ONLY public.ohana
    ADD CONSTRAINT ohana_pk PRIMARY KEY (ohana_id);

ALTER TABLE ONLY public.ohana
    ADD CONSTRAINT ohana_kaneid_fk FOREIGN KEY (kane_id) REFERENCES public.kanaka(kanaka_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.ohana
    ADD CONSTRAINT ohana_wahineid_fk FOREIGN KEY (wahine_id) REFERENCES public.kanaka(kanaka_id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX ohana_kaneid_idx ON public.ohana (kane_id);
CREATE INDEX ohana_wahineid_idx ON public.ohana (wahine_id);


CREATE TABLE public.kamalii (
    kamalii_id integer NOT NULL,
    kanaka_id integer NOT NULL,
    ohana_id integer NOT NULL,
    owner_id uuid NULL, -- nhost user_id
    xref_id text,
    sex character varying(1), -- K|W or M|F
    source_uid text,
    create_timestamp timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.kamalii_id_seq
    AS integer
    START WITH 101
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.kamalii ALTER COLUMN kamalii_id SET DEFAULT nextval('public.kamalii_id_seq'::regclass);

ALTER TABLE ONLY public.kamalii
    ADD CONSTRAINT kamalii_pk PRIMARY KEY (kamalii_id);

CREATE UNIQUE INDEX kamalii_kanakaid_idx ON public.kamalii (kanaka_id);

ALTER TABLE ONLY public.kamalii
    ADD CONSTRAINT kamalii_ohanaid_fk FOREIGN KEY (ohana_id) REFERENCES public.ohana(ohana_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.kamalii
    ADD CONSTRAINT kamalii_kanakaid_fk FOREIGN KEY (kanaka_id) REFERENCES public.kanaka(kanaka_id) ON UPDATE CASCADE ON DELETE CASCADE;

