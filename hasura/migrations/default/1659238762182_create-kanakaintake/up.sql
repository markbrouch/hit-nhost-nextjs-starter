
CREATE TABLE public.kanakaintake (
    intake_id integer NOT NULL,
    mookuauhau_id integer NULL,
    owner_id uuid NULL, -- nhost user_id

    family_name text NULL,
    given_name text NULL,
    birth_date text,
    birth_place text,

    mom_family_name text NULL,
    mom_given_name text NULL,
    mom_birth_date text,
    mom_birth_place text,

    dad_family_name text NULL,
    dad_given_name text NULL,
    dad_birth_date text,
    dad_birth_place text,

    file_id text,
    filename text,

    request_status text NULL, -- new | pending | accepted | rejected 
    create_timestamp timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.kanakaintake_id_seq
    AS integer
    START WITH 101
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.kanakaintake ALTER COLUMN intake_id SET DEFAULT nextval('public.kanakaintake_id_seq'::regclass);

ALTER TABLE ONLY public.kanakaintake
    ADD CONSTRAINT kanakaintake_pk PRIMARY KEY (intake_id);

