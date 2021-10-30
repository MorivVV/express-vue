CREATE TABLE public.test_table
(
    id serial,
    name character varying(50),
    kod integer,
    date_beg timestamp without time zone,
    date_end date,
    active boolean,
    descript character varying,
    "number" numeric(20, 4),
    PRIMARY KEY (id),
    UNIQUE (name),
    UNIQUE (kod),
    FOREIGN KEY (name)
        REFERENCES public.table_name (column_name1) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
        NOT VALID
)