

ALTER TABLE public.mookuauhau ADD COLUMN file_id text NULL;
ALTER TABLE public.mookuauhau ADD COLUMN load_status text NULL; -- new | loading | done | error
