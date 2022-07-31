
CREATE TABLE public.accessrequest (
    request_id integer NOT NULL,
    mookuauhau_id integer NULL,
    requester_id uuid NULL, -- nhost user_id
    owner_id uuid NULL, -- nhost user_id
    name text NULL,
    connection text NULL,
    purpose text NULL,
    type_of_data text NULL,
    request_status text NULL, -- new | pending | accepted | rejected 
    create_timestamp timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.accessrequest_id_seq
    AS integer
    START WITH 101
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.accessrequest ALTER COLUMN request_id SET DEFAULT nextval('public.accessrequest_id_seq'::regclass);

ALTER TABLE ONLY public.accessrequest
    ADD CONSTRAINT accessrequest_pk PRIMARY KEY (request_id);

ALTER TABLE ONLY public.accessrequest
    ADD CONSTRAINT accessrequest_mookuauhauid_fk FOREIGN KEY (mookuauhau_id) REFERENCES public.mookuauhau(mookuauhau_id) ON UPDATE CASCADE ON DELETE CASCADE;

-- CREATE INDEX accessrequest_kaneid_idx ON public.accessrequest (kane_id);
-- CREATE INDEX accessrequest_wahineid_idx ON public.accessrequest (wahine_id);

CREATE INDEX accessrequest_mookuauhauid_idx ON public.accessrequest (mookuauhau_id);


