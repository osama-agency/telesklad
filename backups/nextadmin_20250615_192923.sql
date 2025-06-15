--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Homebrew)
-- Dumped by pg_dump version 16.9 (Homebrew)

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
-- Name: Account; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO eldar;

--
-- Name: ApiKey; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public."ApiKey" (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ApiKey" OWNER TO eldar;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO eldar;

--
-- Name: User; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "coverImage" text,
    password text,
    "passwordResetToken" text,
    "passwordResetTokenExp" timestamp(3) without time zone,
    role text DEFAULT 'USER'::text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    phone text
);


ALTER TABLE public."User" OWNER TO eldar;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public."VerificationToken" (
    id text NOT NULL,
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO eldar;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO eldar;

--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public.exchange_rates (
    id text NOT NULL,
    currency text NOT NULL,
    rate numeric(10,4) NOT NULL,
    "rateWithBuffer" numeric(10,4) NOT NULL,
    "bufferPercent" numeric(5,2) DEFAULT 5.0 NOT NULL,
    source text DEFAULT 'CBR'::text NOT NULL,
    "effectiveDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.exchange_rates OWNER TO eldar;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    date text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount double precision NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.expenses OWNER TO eldar;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: eldar
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO eldar;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: eldar
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text,
    name text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_items OWNER TO eldar;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "externalId" text NOT NULL,
    "customerName" text,
    "customerEmail" text,
    "customerPhone" text,
    status text NOT NULL,
    total numeric(10,2) NOT NULL,
    currency text DEFAULT 'RUB'::text NOT NULL,
    "orderDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bankCard" text,
    bonus numeric(10,2) DEFAULT 0 NOT NULL,
    "customerCity" text,
    "deliveryCost" numeric(10,2) DEFAULT 0 NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "shippedAt" timestamp(3) without time zone,
    "customerAddress" text
);


ALTER TABLE public.orders OWNER TO eldar;

--
-- Name: products; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2),
    stock_quantity integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    ancestry text,
    weight text,
    dosage_form text,
    package_quantity integer,
    main_ingredient text,
    brand text,
    old_price numeric(10,2),
    is_visible boolean DEFAULT true NOT NULL,
    prime_cost numeric(10,2),
    "avgPurchasePriceRub" numeric(10,2)
);


ALTER TABLE public.products OWNER TO eldar;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: eldar
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO eldar;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: eldar
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public.purchase_items (
    id integer NOT NULL,
    quantity integer NOT NULL,
    "costPrice" double precision NOT NULL,
    total double precision NOT NULL,
    "purchaseId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "productName" text NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public.purchase_items OWNER TO eldar;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE; Schema: public; Owner: eldar
--

CREATE SEQUENCE public.purchase_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_items_id_seq OWNER TO eldar;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: eldar
--

ALTER SEQUENCE public.purchase_items_id_seq OWNED BY public.purchase_items.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: eldar
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "totalAmount" double precision NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "isUrgent" boolean DEFAULT false NOT NULL,
    expenses double precision,
    "userId" text NOT NULL
);


ALTER TABLE public.purchases OWNER TO eldar;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: eldar
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO eldar;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: eldar
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_items id; Type: DEFAULT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.purchase_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_items_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: ApiKey; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public."ApiKey" (id, key, name, "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public."User" (id, name, email, "emailVerified", image, "coverImage", password, "passwordResetToken", "passwordResetTokenExp", role, "createdAt", phone) FROM stdin;
360c71c8-71a5-4d69-a511-86db6d4bd7f9	Administrator	go@osama.agency	\N	\N	\N	$2b$12$Lf8NROC26goJvS34eS/4..ClTL//uevO2sUWxTDQhuWJ.igKJWzji	\N	\N	administrator	2025-06-15 19:24:39.117	\N
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public."VerificationToken" (id, identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3c0f6d5f-e553-4b61-9831-e91ea7542f24	0d0444f7167cb05ed536fdc52459014a2a688afa5374a556fe86def2b02f4e39	2025-06-15 19:20:30.274589+03	20250614205850_init	\N	\N	2025-06-15 19:20:30.254614+03	1
1c72a76b-b79d-405e-ac99-eddec61e650d	a2a78c213514cc99e1c39d183c049b5b4cf3f243b30809329133d0cb82d93e64	2025-06-15 19:20:30.275998+03	20250614222618_add_user_profile_fields	\N	\N	2025-06-15 19:20:30.274978+03	1
8f12b09c-a461-489d-a47d-c6b65d53cfde	7f59c9f712727b08d29453ffbd245be175fccb184f127785fe4c4df1b8f38e72	2025-06-15 19:20:30.277707+03	20250614223202_remove_bio_field	\N	\N	2025-06-15 19:20:30.276455+03	1
8735e5d3-4d05-45e1-ad2d-acfd84a2d64c	9bd04316325dba5c079c016f74403f48b8059fb2961fa75e87a2c161017d647e	2025-06-15 19:20:30.28289+03	20250614235712_add_expense_model	\N	\N	2025-06-15 19:20:30.27804+03	1
f117cb3c-207f-4f33-a5ea-5facbbb49042	5cd622ae4c835fc44a29bff163b274927355a76cdc99ecede454fc8783ee0e40	2025-06-15 19:20:30.291147+03	20250615000850_add_purchases_models	\N	\N	2025-06-15 19:20:30.28321+03	1
62e7ba77-e9b3-422d-9378-7d8c64550a6f	30bc41b9feb07c669a7c1ca12f0955672edaacc051cef4276dd97380a7c14e96	2025-06-15 19:20:30.294615+03	20250615001339_update_products_external_api	\N	\N	2025-06-15 19:20:30.291478+03	1
a2b31d40-b7eb-4227-8aac-7620615e68bf	1b86af3f9f62e96ae4447ed840a68313301a85f3f6c78048e81be7765e3e243d	2025-06-15 19:20:30.297718+03	20250615001835_update_product_full_structure	\N	\N	2025-06-15 19:20:30.294942+03	1
89c12a28-8c5b-4b0b-bf62-575487eb04c5	5ce5b694f2e80099b9b79448ce913cb37192c78b4608da128c2c7ee1f9a1d0ef	2025-06-15 19:20:30.302901+03	20250615003208_add_orders_and_order_items	\N	\N	2025-06-15 19:20:30.298081+03	1
ce4ee20e-ec3f-49cc-9ce3-8f50adf880f7	d143f80482c2905bd038bac0f618c88de3fe04224f381fe3ccaf89f566407418	2025-06-15 19:20:30.303966+03	20250615104810_add_prime_cost_to_products	\N	\N	2025-06-15 19:20:30.303218+03	1
0620961b-348a-4a68-b8ef-11e3bc007fd9	69f1fc848f9ec0c1d011b874c9417b6d8b631b81b91fba347da2d3f234c60915	2025-06-15 19:20:30.306683+03	20250615124348_add_exchange_rates_and_avg_purchase_price	\N	\N	2025-06-15 19:20:30.304234+03	1
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public.exchange_rates (id, currency, rate, "rateWithBuffer", "bufferPercent", source, "effectiveDate", "createdAt") FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public.expenses (id, date, category, description, amount, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public.order_items (id, "orderId", "productId", name, quantity, price, total, "createdAt", "updatedAt") FROM stdin;
cmbxvqenp0002vd5hj0i6kqtl	cmbxvqenl0000vd5hqk89mn6k	\N	Attex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.765	2025-06-15 16:28:19.765
cmbxvqent0005vd5hpdivs4qm	cmbxvqens0003vd5h4gmlzgc9	\N	Мирена 20 мкг/24 часа	1	8900.00	8900.00	2025-06-15 16:28:19.77	2025-06-15 16:28:19.77
cmbxvqenw0008vd5hb2cpddv0	cmbxvqenv0006vd5hm6xyaap7	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.772	2025-06-15 16:28:19.772
cmbxvqeny000bvd5h6boigtsp	cmbxvqenx0009vd5hiyuifayp	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.775	2025-06-15 16:28:19.775
cmbxvqeo1000evd5h2fx9stic	cmbxvqeo0000cvd5hdevqvm6s	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:19.778	2025-06-15 16:28:19.778
cmbxvqeo4000hvd5h2awh6cgd	cmbxvqeo2000fvd5hoarr79ss	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.78	2025-06-15 16:28:19.78
cmbxvqeo7000kvd5hu7sbd06x	cmbxvqeo5000ivd5hds1rd84y	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:19.783	2025-06-15 16:28:19.783
cmbxvqeo8000mvd5hi7boefid	cmbxvqeo5000ivd5hds1rd84y	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:19.784	2025-06-15 16:28:19.784
cmbxvqeoa000pvd5hi7n5v9dv	cmbxvqeo9000nvd5hssad3dzi	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.786	2025-06-15 16:28:19.786
cmbxvqeob000svd5hyzzi0h60	cmbxvqeoa000qvd5hl1l5o17e	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.788	2025-06-15 16:28:19.788
cmbxvqeod000vvd5h3syzl43u	cmbxvqeoc000tvd5hft6pmp1c	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.789	2025-06-15 16:28:19.789
cmbxvqeof000yvd5hvl492zh0	cmbxvqeoe000wvd5h72q5iw3z	\N	Atominex 18 mg	2	5200.00	10400.00	2025-06-15 16:28:19.791	2025-06-15 16:28:19.791
cmbxvqeoh0011vd5h8ve46dql	cmbxvqeog000zvd5hpzmrpfxy	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.793	2025-06-15 16:28:19.793
cmbxvqeoj0014vd5hb1jpkr81	cmbxvqeoi0012vd5h5uyrg0rd	\N	Atominex 40 mg	5	5000.00	25000.00	2025-06-15 16:28:19.795	2025-06-15 16:28:19.795
cmbxvqeok0017vd5ha9innh7o	cmbxvqeoj0015vd5h8i3an8tt	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:19.797	2025-06-15 16:28:19.797
cmbxvqeom001avd5hxv7wct35	cmbxvqeol0018vd5h2shnc8k0	\N	Atominex 25 mg	3	5500.00	16500.00	2025-06-15 16:28:19.798	2025-06-15 16:28:19.798
cmbxvqeoo001dvd5hjzkl3cve	cmbxvqeon001bvd5h2su0ddv4	\N	Attex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.8	2025-06-15 16:28:19.8
cmbxvqeoq001gvd5hk6medlba	cmbxvqeop001evd5hp24dhp25	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.802	2025-06-15 16:28:19.802
cmbxvqeor001jvd5hnmjbz1qw	cmbxvqeor001hvd5hqfko0pmu	\N	Atominex 10 mg	2	5000.00	10000.00	2025-06-15 16:28:19.804	2025-06-15 16:28:19.804
cmbxvqeot001mvd5hya4iz1eb	cmbxvqeos001kvd5hgw94fwwr	\N	Attex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.806	2025-06-15 16:28:19.806
cmbxvqeow001pvd5ho903vaer	cmbxvqeou001nvd5h6daa5b60	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:19.808	2025-06-15 16:28:19.808
cmbxvqeox001rvd5hhqyjtlbk	cmbxvqeou001nvd5h6daa5b60	\N	Atominex 100 mg	2	6000.00	12000.00	2025-06-15 16:28:19.809	2025-06-15 16:28:19.809
cmbxvqeoz001uvd5hzo2euejo	cmbxvqeoy001svd5hq0fw6g79	\N	Arislow 4 mg	1	3800.00	3800.00	2025-06-15 16:28:19.811	2025-06-15 16:28:19.811
cmbxvqep0001wvd5hfc2nqfac	cmbxvqeoy001svd5hq0fw6g79	\N	Abilify 5 mg	1	2900.00	2900.00	2025-06-15 16:28:19.812	2025-06-15 16:28:19.812
cmbxvqep1001yvd5hgif59yaz	cmbxvqeoy001svd5hq0fw6g79	\N	Risperdal 1 Mg/ml сироп	1	2800.00	2800.00	2025-06-15 16:28:19.813	2025-06-15 16:28:19.813
cmbxvqep20021vd5h7x5pc3cm	cmbxvqep2001zvd5hj7pu75tb	\N	Abilify 5 mg	1	2900.00	2900.00	2025-06-15 16:28:19.815	2025-06-15 16:28:19.815
cmbxvqep40024vd5ht2rg2nuf	cmbxvqep30022vd5hzan8w7uu	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:19.817	2025-06-15 16:28:19.817
cmbxvqep60027vd5hmvvhf71p	cmbxvqep50025vd5hdl031xyz	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:19.819	2025-06-15 16:28:19.819
cmbxvqep8002avd5hv3jq4iot	cmbxvqep70028vd5hm4nkavkk	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.82	2025-06-15 16:28:19.82
cmbxvqep9002dvd5hgpdjo5kj	cmbxvqep9002bvd5h6u14ma8i	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.822	2025-06-15 16:28:19.822
cmbxvqepb002gvd5h5tf07038	cmbxvqepa002evd5hwxpn0qqn	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.823	2025-06-15 16:28:19.823
cmbxvqepd002jvd5hvasiy483	cmbxvqepc002hvd5hhvvtq3vp	\N	Attex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:19.825	2025-06-15 16:28:19.825
cmbxvqepf002mvd5hzlk0mjwo	cmbxvqepe002kvd5h7b56e7gd	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.827	2025-06-15 16:28:19.827
cmbxvqeph002pvd5hy0xk7j2c	cmbxvqepf002nvd5hbnivog6j	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.829	2025-06-15 16:28:19.829
cmbxvqepi002svd5h3ryynfq1	cmbxvqeph002qvd5h6l4lwmss	\N	Attex 100 mg	2	6500.00	13000.00	2025-06-15 16:28:19.83	2025-06-15 16:28:19.83
cmbxvqepk002vvd5hnxp3ak33	cmbxvqepj002tvd5hbxu1butl	\N	Attex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.832	2025-06-15 16:28:19.832
cmbxvqepm002yvd5hwjza9c6f	cmbxvqepl002wvd5h4z3mw38l	\N	Attex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.834	2025-06-15 16:28:19.834
cmbxvqepo0031vd5h3fbl909h	cmbxvqepn002zvd5h3a2o2ebp	\N	Attex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.836	2025-06-15 16:28:19.836
cmbxvqepp0034vd5hz43pjyb3	cmbxvqepp0032vd5hyuh4thr5	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:19.838	2025-06-15 16:28:19.838
cmbxvqepq0036vd5h2ea0rcy8	cmbxvqepp0032vd5hyuh4thr5	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:19.838	2025-06-15 16:28:19.838
cmbxvqeps0039vd5hafku1vwr	cmbxvqepr0037vd5h00fn4vo3	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.84	2025-06-15 16:28:19.84
cmbxvqepu003cvd5hunxtd27p	cmbxvqept003avd5hi6vc0auy	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:19.842	2025-06-15 16:28:19.842
cmbxvqepv003fvd5hfpxgzo7w	cmbxvqepu003dvd5h9cafw20w	\N	Attex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.844	2025-06-15 16:28:19.844
cmbxvqepx003ivd5hxl85nshe	cmbxvqepw003gvd5hy2pzr3si	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:19.845	2025-06-15 16:28:19.845
cmbxvqepy003lvd5hwe8q9x4b	cmbxvqepy003jvd5hxke15i3q	\N	Arislow 1 mg	1	3200.00	3200.00	2025-06-15 16:28:19.847	2025-06-15 16:28:19.847
cmbxvqeq0003ovd5hkvlipvwe	cmbxvqepz003mvd5hl8k55fg7	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:19.848	2025-06-15 16:28:19.848
cmbxvqeq2003rvd5hh0u83foe	cmbxvqeq1003pvd5hkjcziq76	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.85	2025-06-15 16:28:19.85
cmbxvqeq3003uvd5hltckmt2g	cmbxvqeq2003svd5h4jexb7o0	\N	Attex 100 mg	1	6500.00	6500.00	2025-06-15 16:28:19.852	2025-06-15 16:28:19.852
cmbxvqeq5003xvd5h67fss0bq	cmbxvqeq4003vvd5hlhts4foh	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.853	2025-06-15 16:28:19.853
cmbxvqeq60040vd5hmo331fsq	cmbxvqeq6003yvd5h0ddcz4kv	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:19.855	2025-06-15 16:28:19.855
cmbxvqeq80043vd5hvrl6j9xe	cmbxvqeq70041vd5hsjlzut5r	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.857	2025-06-15 16:28:19.857
cmbxvqeqa0046vd5hz9vcyv99	cmbxvqeq90044vd5hjlfjn9tf	\N	Atominex 25 mg	3	5500.00	16500.00	2025-06-15 16:28:19.858	2025-06-15 16:28:19.858
cmbxvqeqc0049vd5h8bqb28x4	cmbxvqeqb0047vd5hc1b3ndg2	\N	Arislow 2 mg	1	3600.00	3600.00	2025-06-15 16:28:19.86	2025-06-15 16:28:19.86
cmbxvqeqd004cvd5hek639ebs	cmbxvqeqc004avd5hovzc3pw1	\N	Arislow 3 mg	1	3000.00	3000.00	2025-06-15 16:28:19.862	2025-06-15 16:28:19.862
cmbxvqeqg004fvd5hl66bctj2	cmbxvqeqe004dvd5hr3cakxl9	\N	Atominex 100 mg	2	6000.00	12000.00	2025-06-15 16:28:19.864	2025-06-15 16:28:19.864
cmbxvqeqi004ivd5h3o0omb5k	cmbxvqeqh004gvd5h5g1u10cb	\N	Attex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:19.866	2025-06-15 16:28:19.866
cmbxvqeqj004lvd5hxht94axg	cmbxvqeqi004jvd5h4thgojqp	\N	Attex 100 mg	1	6500.00	6500.00	2025-06-15 16:28:19.868	2025-06-15 16:28:19.868
cmbxvqeql004ovd5hg9208gnh	cmbxvqeqk004mvd5h3znq33bg	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.869	2025-06-15 16:28:19.869
cmbxvqeqp004rvd5hylgv3e3s	cmbxvqeqm004pvd5h7rh2i34z	\N	Мирена 20 мкг/24 часа	1	8900.00	8900.00	2025-06-15 16:28:19.874	2025-06-15 16:28:19.874
cmbxvqeqs004uvd5h1460jk05	cmbxvqeqr004svd5h4rffgc8l	\N	Attex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.877	2025-06-15 16:28:19.877
cmbxvqequ004xvd5hh9bzkd1d	cmbxvqeqt004vvd5hx13ohp4b	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.879	2025-06-15 16:28:19.879
cmbxvqeqw0050vd5hg8c0dj43	cmbxvqeqv004yvd5hryd9i2l2	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.881	2025-06-15 16:28:19.881
cmbxvqeqy0052vd5h4btxxdnd	cmbxvqeqv004yvd5hryd9i2l2	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:19.882	2025-06-15 16:28:19.882
cmbxvqer00055vd5hf1wpcqsx	cmbxvqeqz0053vd5hp703iuxx	\N	Atominex 18 mg	3	5200.00	15600.00	2025-06-15 16:28:19.885	2025-06-15 16:28:19.885
cmbxvqer30058vd5hh2th9249	cmbxvqer20056vd5hyueryrjy	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.888	2025-06-15 16:28:19.888
cmbxvqer5005bvd5hhpktuxeb	cmbxvqer40059vd5he2p6wkjs	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:19.89	2025-06-15 16:28:19.89
cmbxvqer8005evd5htyf845cc	cmbxvqer6005cvd5h29gqxk63	\N	Attex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:19.892	2025-06-15 16:28:19.892
cmbxvqer9005hvd5hhv6kxmv4	cmbxvqer8005fvd5hqj37huoh	\N	Attex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:19.894	2025-06-15 16:28:19.894
cmbxvqera005jvd5hneqrgved	cmbxvqer8005fvd5hqj37huoh	\N	Attex 18 mg	1	5500.00	5500.00	2025-06-15 16:28:19.895	2025-06-15 16:28:19.895
cmbxvqerc005mvd5ha1qv0kgr	cmbxvqerb005kvd5hbx37c1ul	\N	Attex 4 mg (сироп)	2	4900.00	9800.00	2025-06-15 16:28:19.897	2025-06-15 16:28:19.897
cmbxvqere005pvd5hcbw576lp	cmbxvqerd005nvd5hrr05aokz	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.898	2025-06-15 16:28:19.898
cmbxvqerf005rvd5hstj9rr3d	cmbxvqerd005nvd5hrr05aokz	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:19.9	2025-06-15 16:28:19.9
cmbxvqeri005uvd5hmjif5svt	cmbxvqerh005svd5hcwnnpk0j	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.902	2025-06-15 16:28:19.902
cmbxvqerj005xvd5h7eanhp51	cmbxvqerj005vvd5hmxdg6lxw	\N	Attex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:19.904	2025-06-15 16:28:19.904
cmbxvqerl0060vd5ho0njthy4	cmbxvqerk005yvd5hqaucqdzp	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.905	2025-06-15 16:28:19.905
cmbxvqern0063vd5hubeefc0y	cmbxvqerm0061vd5hrio2arg8	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:19.907	2025-06-15 16:28:19.907
cmbxvqerp0066vd5hnmxcekrz	cmbxvqero0064vd5h89e2ff2l	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:19.909	2025-06-15 16:28:19.909
cmbxvqerr0069vd5h70rjpcp9	cmbxvqerq0067vd5h1w367wlo	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:19.911	2025-06-15 16:28:19.911
cmbxvqers006cvd5hkmhg83pz	cmbxvqers006avd5hdwk2p2ht	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:19.913	2025-06-15 16:28:19.913
cmbxvqert006evd5hn0s43pel	cmbxvqers006avd5hdwk2p2ht	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:19.914	2025-06-15 16:28:19.914
cmbxvqerv006hvd5hbawqa31w	cmbxvqeru006fvd5h0xcuxhb6	\N	Atominex 40 mg	5	5000.00	25000.00	2025-06-15 16:28:19.916	2025-06-15 16:28:19.916
cmbxvqerx006kvd5hgypg7bkn	cmbxvqerw006ivd5hdmg8kl4d	\N	Attex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.918	2025-06-15 16:28:19.918
cmbxvqerz006nvd5h3qqp1nx7	cmbxvqery006lvd5hilvrp6xi	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:19.919	2025-06-15 16:28:19.919
cmbxvqes0006qvd5hyo63an4j	cmbxvqerz006ovd5h8dqpjweg	\N	Arislow 2 mg	1	3600.00	3600.00	2025-06-15 16:28:19.921	2025-06-15 16:28:19.921
cmbxvqes2006tvd5h81fz4phj	cmbxvqes1006rvd5hirl6n4bi	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.922	2025-06-15 16:28:19.922
cmbxvqes3006wvd5hulgv5c8c	cmbxvqes2006uvd5hdw4g4xnb	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.924	2025-06-15 16:28:19.924
cmbxvqes6006zvd5hz1ivoxym	cmbxvqes4006xvd5h0018n4x2	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:19.926	2025-06-15 16:28:19.926
cmbxvqes70072vd5h59ou174z	cmbxvqes60070vd5h85gz5ff9	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.928	2025-06-15 16:28:19.928
cmbxvqes80075vd5h9fqyh6ee	cmbxvqes80073vd5hlen226dm	\N	Attex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:19.929	2025-06-15 16:28:19.929
cmbxvqesa0078vd5harwr88b8	cmbxvqes90076vd5hvsvc2ecr	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.93	2025-06-15 16:28:19.93
cmbxvqesa007avd5h6fi4rfwf	cmbxvqes90076vd5hvsvc2ecr	\N	Arislow 4 mg	1	3800.00	3800.00	2025-06-15 16:28:19.931	2025-06-15 16:28:19.931
cmbxvqesc007dvd5hge6fewf2	cmbxvqesb007bvd5hiubrgtar	\N	Abilify 15 mg	3	3600.00	10800.00	2025-06-15 16:28:19.933	2025-06-15 16:28:19.933
cmbxvqesd007fvd5hlw517tho	cmbxvqesb007bvd5hiubrgtar	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:19.934	2025-06-15 16:28:19.934
cmbxvqesf007ivd5hu9ezz2i2	cmbxvqese007gvd5hja9wi0is	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.935	2025-06-15 16:28:19.935
cmbxvqesg007lvd5h0b41fh40	cmbxvqesg007jvd5hv8407l9o	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.937	2025-06-15 16:28:19.937
cmbxvqesi007ovd5higvf88m3	cmbxvqesh007mvd5h2m4fvlfz	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:19.938	2025-06-15 16:28:19.938
cmbxvqesj007rvd5hep6zj4s8	cmbxvqesj007pvd5hdgzffep5	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.94	2025-06-15 16:28:19.94
cmbxvqesm007uvd5h9sozjyjl	cmbxvqesk007svd5hww0ph5se	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.942	2025-06-15 16:28:19.942
cmbxvqesn007xvd5h54vxkto9	cmbxvqesn007vvd5hqilb965e	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.944	2025-06-15 16:28:19.944
cmbxvqesp0080vd5h73dcymwc	cmbxvqeso007yvd5hds1yw7fu	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.945	2025-06-15 16:28:19.945
cmbxvqesq0083vd5hvjyx7mkd	cmbxvqesq0081vd5h28iki2y5	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.947	2025-06-15 16:28:19.947
cmbxvqess0086vd5hxxd4xh33	cmbxvqesr0084vd5hlwlwe64d	\N	Atominex 60 mg	3	5500.00	16500.00	2025-06-15 16:28:19.948	2025-06-15 16:28:19.948
cmbxvqesu0089vd5h0bgftcdk	cmbxvqess0087vd5h93536fg5	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.95	2025-06-15 16:28:19.95
cmbxvqesv008cvd5hk7qdy12x	cmbxvqesu008avd5hhukowmfs	\N	Atominex 60 mg	2	5500.00	11000.00	2025-06-15 16:28:19.952	2025-06-15 16:28:19.952
cmbxvqesx008fvd5hj5umgdsc	cmbxvqesw008dvd5hsc43og19	\N	Attex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.953	2025-06-15 16:28:19.953
cmbxvqesy008ivd5hlpolid2z	cmbxvqesx008gvd5hgmo4piwf	\N	Attex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.954	2025-06-15 16:28:19.954
cmbxvqesz008lvd5he4evmtpc	cmbxvqesz008jvd5h08l9549o	\N	Atominex 40 mg	3	5000.00	15000.00	2025-06-15 16:28:19.956	2025-06-15 16:28:19.956
cmbxvqet1008ovd5hmulcpwgc	cmbxvqet0008mvd5h49hhdszm	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.957	2025-06-15 16:28:19.957
cmbxvqet2008rvd5hzjp9o8g6	cmbxvqet2008pvd5hnf9lehxd	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.959	2025-06-15 16:28:19.959
cmbxvqet4008uvd5hnwnvs72p	cmbxvqet3008svd5h7sdupooj	\N	Attex 60 mg	2	5500.00	11000.00	2025-06-15 16:28:19.96	2025-06-15 16:28:19.96
cmbxvqet5008xvd5hk2t1y1mz	cmbxvqet5008vvd5h2r9rfoi1	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:19.962	2025-06-15 16:28:19.962
cmbxvqet70090vd5hxi1y12fc	cmbxvqet6008yvd5hovzrcwtz	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:19.963	2025-06-15 16:28:19.963
cmbxvqet80093vd5hssfs8kqz	cmbxvqet70091vd5h8d9iun0s	\N	Arislow 1 mg	1	3200.00	3200.00	2025-06-15 16:28:19.965	2025-06-15 16:28:19.965
cmbxvqet90095vd5h26337e0i	cmbxvqet70091vd5h8d9iun0s	\N	Arislow 2 mg	1	3600.00	3600.00	2025-06-15 16:28:19.965	2025-06-15 16:28:19.965
cmbxvqet90097vd5hfj93vzdl	cmbxvqet70091vd5h8d9iun0s	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:19.966	2025-06-15 16:28:19.966
cmbxvqetb009avd5hstjxy4xg	cmbxvqeta0098vd5ht2766ceh	\N	Atominex 10 mg	2	5000.00	10000.00	2025-06-15 16:28:19.967	2025-06-15 16:28:19.967
cmbxvqetc009dvd5hdl01w40c	cmbxvqetc009bvd5hm0747223	\N	Atominex 18 mg	2	5200.00	10400.00	2025-06-15 16:28:19.969	2025-06-15 16:28:19.969
cmbxvqete009gvd5hpcbmsaeg	cmbxvqetd009evd5hi2583cva	\N	Мирена 20 мкг/24 часа	1	8900.00	8900.00	2025-06-15 16:28:19.97	2025-06-15 16:28:19.97
cmbxvqetf009jvd5hf5x9vcyv	cmbxvqete009hvd5hxws1vzw5	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.972	2025-06-15 16:28:19.972
cmbxvqeth009mvd5hbq6v3319	cmbxvqetg009kvd5hyjn06p03	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:19.973	2025-06-15 16:28:19.973
cmbxvqeti009pvd5hlun5wuz8	cmbxvqeth009nvd5hlwuxqk69	\N	Attex 100 mg	1	6500.00	6500.00	2025-06-15 16:28:19.974	2025-06-15 16:28:19.974
cmbxvqetk009svd5hmuzzgafn	cmbxvqetj009qvd5hm1cs2yas	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:19.976	2025-06-15 16:28:19.976
cmbxvqetl009vvd5hyxtnqnlf	cmbxvqetk009tvd5hmzn09aay	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.978	2025-06-15 16:28:19.978
cmbxvqeto009yvd5hn1i8e6s2	cmbxvqetn009wvd5hs27dds3o	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:19.981	2025-06-15 16:28:19.981
cmbxvqetq00a1vd5hvzj05e90	cmbxvqetp009zvd5ho8a6ynnc	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.982	2025-06-15 16:28:19.982
cmbxvqets00a4vd5h3ipf0zjo	cmbxvqetr00a2vd5hqjz0dg28	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.984	2025-06-15 16:28:19.984
cmbxvqett00a7vd5h4qvxhxo2	cmbxvqett00a5vd5hz4e0qslg	\N	Attex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:19.986	2025-06-15 16:28:19.986
cmbxvqetv00aavd5h0u7j1aql	cmbxvqetu00a8vd5h3xy3cfc8	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:19.988	2025-06-15 16:28:19.988
cmbxvqetx00advd5hctcxjafx	cmbxvqetw00abvd5h7xnxjy3j	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:19.99	2025-06-15 16:28:19.99
cmbxvqetz00agvd5h69d4lwml	cmbxvqety00aevd5h7gdm5yvq	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.992	2025-06-15 16:28:19.992
cmbxvqeu100ajvd5hcsfisd0m	cmbxvqeu000ahvd5h10qxeokj	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.994	2025-06-15 16:28:19.994
cmbxvqeu300amvd5h11xm6qzv	cmbxvqeu200akvd5hhuikj1wx	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:19.995	2025-06-15 16:28:19.995
cmbxvqeu500apvd5h5r0vk6ti	cmbxvqeu400anvd5h4y7u2c65	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:19.998	2025-06-15 16:28:19.998
cmbxvqeu700asvd5h4xnd9omw	cmbxvqeu600aqvd5hwcw9cw47	\N	Atominex 60 mg	2	5500.00	11000.00	2025-06-15 16:28:20	2025-06-15 16:28:20
cmbxvqeu900avvd5hyoyafe80	cmbxvqeu800atvd5hp5oqd6b5	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.002	2025-06-15 16:28:20.002
cmbxvqeub00ayvd5hw99o77g0	cmbxvqeua00awvd5hhq65k8wy	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.003	2025-06-15 16:28:20.003
cmbxvqeuc00b1vd5hazi4lrro	cmbxvqeub00azvd5h3konnca3	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:20.005	2025-06-15 16:28:20.005
cmbxvqeue00b4vd5hljnyy1x8	cmbxvqeud00b2vd5hlwz8rnkc	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.006	2025-06-15 16:28:20.006
cmbxvqeug00b7vd5hrqmv0w9m	cmbxvqeuf00b5vd5hiv1i03k1	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.008	2025-06-15 16:28:20.008
cmbxvqeuh00b9vd5hvrhrdqcx	cmbxvqeuf00b5vd5hiv1i03k1	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.009	2025-06-15 16:28:20.009
cmbxvqeui00bbvd5h9z0umyg4	cmbxvqeuf00b5vd5hiv1i03k1	\N	HHS A1 L-Carnitine Lepidium	1	1800.00	1800.00	2025-06-15 16:28:20.01	2025-06-15 16:28:20.01
cmbxvqeui00bdvd5hbh624z0u	cmbxvqeuf00b5vd5hiv1i03k1	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.011	2025-06-15 16:28:20.011
cmbxvqeuk00bgvd5hbtwpqlnu	cmbxvqeuj00bevd5hoa6xvcyc	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:20.012	2025-06-15 16:28:20.012
cmbxvqeul00bjvd5hoz1w7ltl	cmbxvqeul00bhvd5hvj5ctyii	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.014	2025-06-15 16:28:20.014
cmbxvqeun00bmvd5hc431i8d2	cmbxvqeum00bkvd5hsugb8jzm	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:20.016	2025-06-15 16:28:20.016
cmbxvqeuq00bpvd5h8uhczqj0	cmbxvqeup00bnvd5hix7hnoit	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.018	2025-06-15 16:28:20.018
cmbxvqeus00bsvd5hauwk16wu	cmbxvqeur00bqvd5hmgwjmk37	\N	HHS A1 L-Carnitine Lepidium	1	1800.00	1800.00	2025-06-15 16:28:20.02	2025-06-15 16:28:20.02
cmbxvqeus00buvd5h6htg1e92	cmbxvqeur00bqvd5hmgwjmk37	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.021	2025-06-15 16:28:20.021
cmbxvqeuu00bxvd5h7e37e8dv	cmbxvqeut00bvvd5hvd53z6m7	\N	Atominex 25 mg	3	5500.00	16500.00	2025-06-15 16:28:20.023	2025-06-15 16:28:20.023
cmbxvqeuw00c0vd5hwuyihi43	cmbxvqeuv00byvd5h4wcin2rw	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.025	2025-06-15 16:28:20.025
cmbxvqeuy00c3vd5hvd8pabt6	cmbxvqeux00c1vd5h57agz3kh	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.027	2025-06-15 16:28:20.027
cmbxvqev000c6vd5hhdld63kq	cmbxvqeuz00c4vd5hsiepdran	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.028	2025-06-15 16:28:20.028
cmbxvqev100c8vd5hoztq423g	cmbxvqeuz00c4vd5hsiepdran	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.029	2025-06-15 16:28:20.029
cmbxvqev200cbvd5hxujtty8z	cmbxvqev100c9vd5h8kri0832	\N	Attex 18 mg	1	5500.00	5500.00	2025-06-15 16:28:20.031	2025-06-15 16:28:20.031
cmbxvqev600cevd5hyx5jv6st	cmbxvqev300ccvd5h5r728nhx	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.034	2025-06-15 16:28:20.034
cmbxvqev800chvd5hoax79po0	cmbxvqev700cfvd5hu3l62txu	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.037	2025-06-15 16:28:20.037
cmbxvqev900cjvd5hpm4wzbkl	cmbxvqev700cfvd5hu3l62txu	\N	Attex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.038	2025-06-15 16:28:20.038
cmbxvqevb00cmvd5h8sh9xx66	cmbxvqeva00ckvd5h1gyb678u	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.039	2025-06-15 16:28:20.039
cmbxvqevc00cpvd5h2scbj3rv	cmbxvqevc00cnvd5h6osj9636	\N	Attex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:20.041	2025-06-15 16:28:20.041
cmbxvqevf00csvd5hoprq7r03	cmbxvqeve00cqvd5hcu3l6z6s	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.043	2025-06-15 16:28:20.043
cmbxvqevg00cuvd5hdgp1e9ob	cmbxvqeve00cqvd5hcu3l6z6s	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.045	2025-06-15 16:28:20.045
cmbxvqevi00cxvd5h4ybhxuxc	cmbxvqevh00cvvd5h6dh1j85g	\N	Attex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.046	2025-06-15 16:28:20.046
cmbxvqevj00d0vd5hdygguwfj	cmbxvqevj00cyvd5hjyu0f75f	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:20.048	2025-06-15 16:28:20.048
cmbxvqevl00d3vd5hi5ofocdh	cmbxvqevk00d1vd5hklhih7us	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:20.05	2025-06-15 16:28:20.05
cmbxvqevo00d6vd5h0qwzhekg	cmbxvqevn00d4vd5h8u3kvqpi	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.052	2025-06-15 16:28:20.052
cmbxvqevp00d9vd5hsbyrgo07	cmbxvqevp00d7vd5h4gsoxca0	\N	Atominex 10 mg	2	5000.00	10000.00	2025-06-15 16:28:20.054	2025-06-15 16:28:20.054
cmbxvqevr00dcvd5hd4fwb3gv	cmbxvqevq00davd5hevsejsa6	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.055	2025-06-15 16:28:20.055
cmbxvqevs00dfvd5hy609evy4	cmbxvqevs00ddvd5hj90c1ulk	\N	Attex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.057	2025-06-15 16:28:20.057
cmbxvqevu00dhvd5h97ea1asv	cmbxvqevs00ddvd5hj90c1ulk	\N	Atominex 40 mg	6	5000.00	30000.00	2025-06-15 16:28:20.058	2025-06-15 16:28:20.058
cmbxvqevv00djvd5hdbqq6zme	cmbxvqevs00ddvd5hj90c1ulk	\N	Attex 18 mg	1	5500.00	5500.00	2025-06-15 16:28:20.059	2025-06-15 16:28:20.059
cmbxvqevw00dlvd5hgkmp0n62	cmbxvqevs00ddvd5hj90c1ulk	\N	Abilify 15 mg	1	3600.00	3600.00	2025-06-15 16:28:20.06	2025-06-15 16:28:20.06
cmbxvqevx00dnvd5hsg9ljebj	cmbxvqevs00ddvd5hj90c1ulk	\N	Attex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.061	2025-06-15 16:28:20.061
cmbxvqevz00dqvd5hl0w776oa	cmbxvqevy00dovd5hf48my92d	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.063	2025-06-15 16:28:20.063
cmbxvqew000dsvd5hj2zjcebt	cmbxvqevy00dovd5hf48my92d	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.064	2025-06-15 16:28:20.064
cmbxvqew200dvvd5h5zc7wifk	cmbxvqew100dtvd5h61yp2vhd	\N	Atominex 10 mg	2	5000.00	10000.00	2025-06-15 16:28:20.066	2025-06-15 16:28:20.066
cmbxvqew400dyvd5h0g6ymuuf	cmbxvqew300dwvd5hwc6lozl2	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.068	2025-06-15 16:28:20.068
cmbxvqew500e1vd5hqgcqlff9	cmbxvqew500dzvd5hyxm5jark	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:20.07	2025-06-15 16:28:20.07
cmbxvqew700e4vd5hheipnl9t	cmbxvqew600e2vd5h0u92ofas	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.071	2025-06-15 16:28:20.071
cmbxvqew900e7vd5hq81qlq2p	cmbxvqew800e5vd5hrw01ez5m	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:20.074	2025-06-15 16:28:20.074
cmbxvqewc00eavd5hev5u1zix	cmbxvqewb00e8vd5hytiypo71	\N	Atominex 10 mg	2	5000.00	10000.00	2025-06-15 16:28:20.076	2025-06-15 16:28:20.076
cmbxvqewe00edvd5hqt2xi70r	cmbxvqewd00ebvd5hbmyux0tg	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.078	2025-06-15 16:28:20.078
cmbxvqewg00egvd5hucjqoajg	cmbxvqewf00eevd5hzacdaikd	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.08	2025-06-15 16:28:20.08
cmbxvqewh00ejvd5hpblo50ge	cmbxvqewg00ehvd5hu9f9l5sr	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.082	2025-06-15 16:28:20.082
cmbxvqewi00elvd5hqxjm4cvl	cmbxvqewg00ehvd5hu9f9l5sr	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.082	2025-06-15 16:28:20.082
cmbxvqewk00eovd5hhsbsyy0q	cmbxvqewj00emvd5h63o7hkoz	\N	Attex 4 mg (сироп)	1	4900.00	4900.00	2025-06-15 16:28:20.085	2025-06-15 16:28:20.085
cmbxvqewm00ervd5hx5e7h3ei	cmbxvqewl00epvd5homquexnr	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.086	2025-06-15 16:28:20.086
cmbxvqewo00euvd5hodei02xq	cmbxvqewn00esvd5hz58w10wc	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.088	2025-06-15 16:28:20.088
cmbxvqewq00exvd5hdc3uui66	cmbxvqewp00evvd5ho2krsmtf	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.09	2025-06-15 16:28:20.09
cmbxvqews00f0vd5hkf7043ak	cmbxvqewr00eyvd5h6c7p66zz	\N	Attex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.092	2025-06-15 16:28:20.092
cmbxvqewu00f3vd5ha2rj0j22	cmbxvqewt00f1vd5hdrtsfou9	\N	Atominex 100 mg	1	6000.00	6000.00	2025-06-15 16:28:20.094	2025-06-15 16:28:20.094
cmbxvqeww00f6vd5h1nguv2th	cmbxvqewv00f4vd5h4sgtlg0k	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:20.096	2025-06-15 16:28:20.096
cmbxvqewx00f9vd5ht9v5zhyy	cmbxvqeww00f7vd5h1jqze5d8	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.098	2025-06-15 16:28:20.098
cmbxvqewz00fcvd5humeaugj8	cmbxvqewy00favd5hpjihh9fw	\N	Attex 4 mg (сироп)	4	4900.00	19600.00	2025-06-15 16:28:20.1	2025-06-15 16:28:20.1
cmbxvqex100ffvd5h5594b3x5	cmbxvqex000fdvd5hn15wrryh	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.101	2025-06-15 16:28:20.101
cmbxvqex300fivd5h6792kns7	cmbxvqex200fgvd5hsbbbzobk	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.103	2025-06-15 16:28:20.103
cmbxvqex400flvd5h6y6u0abr	cmbxvqex400fjvd5h1zryga15	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.105	2025-06-15 16:28:20.105
cmbxvqex600fovd5hotytyh82	cmbxvqex500fmvd5hp5do0wy4	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.106	2025-06-15 16:28:20.106
cmbxvqex800frvd5h07yjfke4	cmbxvqex700fpvd5hb98yoeo7	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.108	2025-06-15 16:28:20.108
cmbxvqex900fuvd5hj2givqck	cmbxvqex800fsvd5hjo1rdw1l	\N	Atominex 40 mg	7	5000.00	35000.00	2025-06-15 16:28:20.11	2025-06-15 16:28:20.11
cmbxvqexb00fxvd5hmuexyi5a	cmbxvqexa00fvvd5hllk6p71l	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.112	2025-06-15 16:28:20.112
cmbxvqexd00g0vd5hdw8szokj	cmbxvqexc00fyvd5h6jfct17v	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.113	2025-06-15 16:28:20.113
cmbxvqexe00g3vd5hc0wdp584	cmbxvqexd00g1vd5hbh4sk083	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:20.115	2025-06-15 16:28:20.115
cmbxvqexh00g6vd5hovsr6qb6	cmbxvqexg00g4vd5ha1fllwet	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.118	2025-06-15 16:28:20.118
cmbxvqexj00g9vd5h4nv5dzq2	cmbxvqexi00g7vd5hbj71zdyv	\N	Atominex 60 mg	2	5500.00	11000.00	2025-06-15 16:28:20.119	2025-06-15 16:28:20.119
cmbxvqexk00gcvd5h92jviut7	cmbxvqexk00gavd5hadz65d3c	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:20.121	2025-06-15 16:28:20.121
cmbxvqexm00gfvd5hp84um4o3	cmbxvqexl00gdvd5htiuq6ac8	\N	HHS A1 L-Carnitine Lepidium	2	1800.00	3600.00	2025-06-15 16:28:20.122	2025-06-15 16:28:20.122
cmbxvqexo00givd5h34j98jb7	cmbxvqexn00ggvd5hct2caupm	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.124	2025-06-15 16:28:20.124
cmbxvqexp00glvd5hizyuf2m7	cmbxvqexo00gjvd5h97gcm7wv	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.126	2025-06-15 16:28:20.126
cmbxvqexq00gnvd5h3yp1tmmp	cmbxvqexo00gjvd5h97gcm7wv	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.127	2025-06-15 16:28:20.127
cmbxvqexs00gqvd5huzqu00ai	cmbxvqexr00govd5h03wu0ege	\N	Attex 4 mg (сироп)	1	4900.00	4900.00	2025-06-15 16:28:20.128	2025-06-15 16:28:20.128
cmbxvqext00gtvd5hfbsj9ott	cmbxvqexs00grvd5hks7nsoc0	\N	Atominex 40 mg	3	5000.00	15000.00	2025-06-15 16:28:20.13	2025-06-15 16:28:20.13
cmbxvqexv00gwvd5hgt4qv0uc	cmbxvqexu00guvd5hn0wxih8y	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.131	2025-06-15 16:28:20.131
cmbxvqexx00gzvd5hcqi2w4nj	cmbxvqexw00gxvd5hnxosw8gk	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.133	2025-06-15 16:28:20.133
cmbxvqexz00h2vd5hnxiw1o7a	cmbxvqexy00h0vd5hkxljqb5j	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.135	2025-06-15 16:28:20.135
cmbxvqey000h5vd5h1ejp33ng	cmbxvqey000h3vd5h62dtt8hw	\N	Atominex 18 mg	2	5200.00	10400.00	2025-06-15 16:28:20.137	2025-06-15 16:28:20.137
cmbxvqey500h8vd5hye8lrldb	cmbxvqey200h6vd5hzjh5ke9f	\N	Attex 4 mg (сироп)	2	4900.00	9800.00	2025-06-15 16:28:20.142	2025-06-15 16:28:20.142
cmbxvqey700hbvd5hewv8nyby	cmbxvqey600h9vd5h1842ayt1	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.144	2025-06-15 16:28:20.144
cmbxvqey900hevd5hothadplc	cmbxvqey800hcvd5hi94zarvo	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.145	2025-06-15 16:28:20.145
cmbxvqeyb00hhvd5hxephx9wu	cmbxvqeya00hfvd5hou9azn49	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.147	2025-06-15 16:28:20.147
cmbxvqeyc00hkvd5hieck1wnu	cmbxvqeyb00hivd5hiau81trb	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.149	2025-06-15 16:28:20.149
cmbxvqeye00hnvd5hst829bl1	cmbxvqeyd00hlvd5h0fom6ouq	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:20.15	2025-06-15 16:28:20.15
cmbxvqeyg00hqvd5h76pl25wi	cmbxvqeyf00hovd5hxn68ue7w	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.152	2025-06-15 16:28:20.152
cmbxvqeyh00htvd5ht111en41	cmbxvqeyg00hrvd5hzq1cjmkm	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.154	2025-06-15 16:28:20.154
cmbxvqeyj00hwvd5ha1x1r5ww	cmbxvqeyi00huvd5hd69q56i7	\N	Atominex 60 mg	2	5500.00	11000.00	2025-06-15 16:28:20.155	2025-06-15 16:28:20.155
cmbxvqeyj00hyvd5hpdsdmqo4	cmbxvqeyi00huvd5hd69q56i7	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.156	2025-06-15 16:28:20.156
cmbxvqeyl00i1vd5hvqihva0g	cmbxvqeyk00hzvd5hbrf7nmgn	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:20.157	2025-06-15 16:28:20.157
cmbxvqeym00i4vd5h9k14stqe	cmbxvqeyl00i2vd5h06v1pqss	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:20.159	2025-06-15 16:28:20.159
cmbxvqeyp00i7vd5hxhim62c4	cmbxvqeyn00i5vd5h51i5dlwx	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.161	2025-06-15 16:28:20.161
cmbxvqeyr00iavd5hj12u3yf1	cmbxvqeyp00i8vd5hb83atvu5	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.163	2025-06-15 16:28:20.163
cmbxvqeys00icvd5hf0ql5lc1	cmbxvqeyp00i8vd5hb83atvu5	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.164	2025-06-15 16:28:20.164
cmbxvqeyt00ifvd5h5m3r5io5	cmbxvqeys00idvd5hpesa3oy2	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.166	2025-06-15 16:28:20.166
cmbxvqeyv00iivd5hameiqbes	cmbxvqeyu00igvd5hxl026azq	\N	Atominex 60 mg	3	5500.00	16500.00	2025-06-15 16:28:20.168	2025-06-15 16:28:20.168
cmbxvqeyx00ilvd5hk7fk69va	cmbxvqeyw00ijvd5h2zhw8mr9	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.17	2025-06-15 16:28:20.17
cmbxvqeyz00iovd5h5ws2euna	cmbxvqeyy00imvd5h2pzljz46	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.172	2025-06-15 16:28:20.172
cmbxvqez100irvd5hclnlebsi	cmbxvqez000ipvd5hzepd3rr6	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.173	2025-06-15 16:28:20.173
cmbxvqez300iuvd5h43w39o32	cmbxvqez200isvd5h60c7bkak	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.175	2025-06-15 16:28:20.175
cmbxvqez500ixvd5hytgeu78g	cmbxvqez400ivvd5hmzuoccz4	\N	Atominex 80 mg	2	5750.00	11500.00	2025-06-15 16:28:20.177	2025-06-15 16:28:20.177
cmbxvqez600j0vd5h6ma46v3t	cmbxvqez500iyvd5hy8mfsw82	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.179	2025-06-15 16:28:20.179
cmbxvqez800j3vd5hooopfuhk	cmbxvqez700j1vd5huxm5gipg	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.181	2025-06-15 16:28:20.181
cmbxvqeza00j6vd5hazrl6ugi	cmbxvqez900j4vd5hzfy0zjz9	\N	Strattera 4 mg ( 100 мл )	1	5900.00	5900.00	2025-06-15 16:28:20.182	2025-06-15 16:28:20.182
cmbxvqezb00j9vd5he5b74vd4	cmbxvqeza00j7vd5hwbc5s9ta	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.184	2025-06-15 16:28:20.184
cmbxvqezd00jcvd5hxg7qyr4f	cmbxvqezc00javd5hma5js05c	\N	Atominex 60 mg	1	5500.00	5500.00	2025-06-15 16:28:20.186	2025-06-15 16:28:20.186
cmbxvqezf00jfvd5h3s6sbl7u	cmbxvqeze00jdvd5hav51zhf9	\N	Atominex 60 mg	2	5500.00	11000.00	2025-06-15 16:28:20.187	2025-06-15 16:28:20.187
cmbxvqezg00jivd5hkim6lvyz	cmbxvqezf00jgvd5hh9fhpy29	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.189	2025-06-15 16:28:20.189
cmbxvqezi00jlvd5hmizdv4gw	cmbxvqezh00jjvd5hstihs5cs	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.19	2025-06-15 16:28:20.19
cmbxvqezj00jnvd5hrbq5wzdp	cmbxvqezh00jjvd5hstihs5cs	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.191	2025-06-15 16:28:20.191
cmbxvqezl00jqvd5hd8ai6pyy	cmbxvqezk00jovd5hsyuvmycz	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.193	2025-06-15 16:28:20.193
cmbxvqezm00jtvd5hknlw24uf	cmbxvqezl00jrvd5hqje3avsf	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.195	2025-06-15 16:28:20.195
cmbxvqezo00jwvd5h58mvjah3	cmbxvqezn00juvd5hhn3jm6f0	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.196	2025-06-15 16:28:20.196
cmbxvqezp00jzvd5h2ykdu1dj	cmbxvqezp00jxvd5hmx8420ij	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.198	2025-06-15 16:28:20.198
cmbxvqezr00k2vd5htvq3ky9r	cmbxvqezq00k0vd5hmv33d04p	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.2	2025-06-15 16:28:20.2
cmbxvqezt00k5vd5h7csv6jl5	cmbxvqezs00k3vd5h0wkjxm37	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.202	2025-06-15 16:28:20.202
cmbxvqezv00k8vd5hgz8sd80c	cmbxvqezu00k6vd5h2rz5jmsk	\N	Atominex 18 mg	1	5200.00	5200.00	2025-06-15 16:28:20.203	2025-06-15 16:28:20.203
cmbxvqezw00kavd5hw65b3suh	cmbxvqezu00k6vd5h2rz5jmsk	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.204	2025-06-15 16:28:20.204
cmbxvqezx00kdvd5hm2nzyq4h	cmbxvqezw00kbvd5h4onuo38x	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.206	2025-06-15 16:28:20.206
cmbxvqezy00kfvd5hc3uuwp56	cmbxvqezw00kbvd5h4onuo38x	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.206	2025-06-15 16:28:20.206
cmbxvqf0000kivd5h4t00mtlu	cmbxvqezz00kgvd5hzjzd1dhf	\N	Atominex 10 mg	1	5000.00	5000.00	2025-06-15 16:28:20.208	2025-06-15 16:28:20.208
cmbxvqf0200klvd5hzq7xepad	cmbxvqf0100kjvd5h5ppxu371	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.21	2025-06-15 16:28:20.21
cmbxvqf0400kovd5hlsxuqnp1	cmbxvqf0300kmvd5h7lrzp8ri	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.212	2025-06-15 16:28:20.212
cmbxvqf0500krvd5h1s4f9mr9	cmbxvqf0400kpvd5h27ghk2rp	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:20.214	2025-06-15 16:28:20.214
cmbxvqf0800kuvd5hsu22r010	cmbxvqf0600ksvd5hd4eziq2e	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.217	2025-06-15 16:28:20.217
cmbxvqf0a00kxvd5hma1ayt0j	cmbxvqf0900kvvd5h9zif2wwe	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.219	2025-06-15 16:28:20.219
cmbxvqf0c00l0vd5hbol2kzds	cmbxvqf0b00kyvd5hqiemkrxa	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.22	2025-06-15 16:28:20.22
cmbxvqf0d00l3vd5h13ow8wbr	cmbxvqf0d00l1vd5hnci3ojio	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.222	2025-06-15 16:28:20.222
cmbxvqf0f00l6vd5hwbbnh2ij	cmbxvqf0e00l4vd5hgt6w9uhg	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:20.223	2025-06-15 16:28:20.223
cmbxvqf0h00l9vd5h3671fxgv	cmbxvqf0g00l7vd5h8h27uxhj	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.225	2025-06-15 16:28:20.225
cmbxvqf0j00lcvd5h4fc4a629	cmbxvqf0i00lavd5hfh5ellgd	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.227	2025-06-15 16:28:20.227
cmbxvqf0k00lfvd5htrqyeyrj	cmbxvqf0j00ldvd5hm695z5cj	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.229	2025-06-15 16:28:20.229
cmbxvqf0m00livd5hnli5h7ld	cmbxvqf0l00lgvd5ht608nas5	\N	Atominex 60 mg	2	5500.00	11000.00	2025-06-15 16:28:20.231	2025-06-15 16:28:20.231
cmbxvqf0o00llvd5hv7draa52	cmbxvqf0n00ljvd5howq2orzd	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:20.232	2025-06-15 16:28:20.232
cmbxvqf0q00lovd5h2rq65kmo	cmbxvqf0p00lmvd5h0dduckpb	\N	Strattera 4 mg ( 100 мл )	1	5900.00	5900.00	2025-06-15 16:28:20.234	2025-06-15 16:28:20.234
cmbxvqf0s00lrvd5hoauq76jt	cmbxvqf0r00lpvd5he5jpxo2u	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.236	2025-06-15 16:28:20.236
cmbxvqf0t00luvd5hw3aq1vre	cmbxvqf0t00lsvd5hqkjekjvk	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.238	2025-06-15 16:28:20.238
cmbxvqf0v00lxvd5hmv8oxfwc	cmbxvqf0u00lvvd5hzq1s77x5	\N	Strattera 4 mg ( 100 мл )	1	5900.00	5900.00	2025-06-15 16:28:20.239	2025-06-15 16:28:20.239
cmbxvqf0w00m0vd5holkim9f9	cmbxvqf0w00lyvd5ha61ocazo	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.241	2025-06-15 16:28:20.241
cmbxvqf0y00m3vd5hvwwdn4az	cmbxvqf0x00m1vd5haz4cyg9h	\N	Attex 4 mg (сироп)	1	4900.00	4900.00	2025-06-15 16:28:20.243	2025-06-15 16:28:20.243
cmbxvqf1000m6vd5hsdcg9qz1	cmbxvqf0z00m4vd5hqeh8zpq0	\N	Atominex 25 mg	2	5500.00	11000.00	2025-06-15 16:28:20.245	2025-06-15 16:28:20.245
cmbxvqf1200m9vd5hk2hftr87	cmbxvqf1100m7vd5hg4oeblf1	\N	Atominex 100 mg	3	6500.00	19500.00	2025-06-15 16:28:20.246	2025-06-15 16:28:20.246
cmbxvqf1300mcvd5h39morklo	cmbxvqf1200mavd5ht99tecfm	\N	Atominex 18 mg	2	5200.00	10400.00	2025-06-15 16:28:20.247	2025-06-15 16:28:20.247
cmbxvqf1500mfvd5henfsuxz4	cmbxvqf1400mdvd5hjm7rlbio	\N	Atominex 25 mg	1	5500.00	5500.00	2025-06-15 16:28:20.249	2025-06-15 16:28:20.249
cmbxvqf1700mivd5hl0lvfmsd	cmbxvqf1500mgvd5hkubfmedw	\N	Atominex 60 mg	2	5500.00	11000.00	2025-06-15 16:28:20.251	2025-06-15 16:28:20.251
cmbxvqf1800mlvd5h38pbex5u	cmbxvqf1700mjvd5hve6hct89	\N	Atominex 40 mg	2	5000.00	10000.00	2025-06-15 16:28:20.253	2025-06-15 16:28:20.253
cmbxvqf1a00movd5hszuluh3u	cmbxvqf1900mmvd5hbw44a97e	\N	Atominex 80 mg	1	5750.00	5750.00	2025-06-15 16:28:20.254	2025-06-15 16:28:20.254
cmbxvqf1b00mrvd5hldvunjn3	cmbxvqf1b00mpvd5hdr01kgut	\N	Atominex 40 mg	1	5000.00	5000.00	2025-06-15 16:28:20.256	2025-06-15 16:28:20.256
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public.orders (id, "externalId", "customerName", "customerEmail", "customerPhone", status, total, currency, "orderDate", "createdAt", "updatedAt", "bankCard", bonus, "customerCity", "deliveryCost", "paidAt", "shippedAt", "customerAddress") FROM stdin;
cmbxvqenl0000vd5hqk89mn6k	1238	Логвинова  Дарья Геннадьевна	\N	\N	overdue	5500.00	RUB	2025-06-12 14:20:40	2025-06-12 14:20:40	2025-06-15 16:28:19.757	ОТП БАНК Максим М.	0.00	г Москва	500.00	\N	\N	\N
cmbxvqens0003vd5h4gmlzgc9	1237	Михайловская Анастасия  Андреевна 	\N	\N	overdue	9400.00	RUB	2025-06-12 13:53:19	2025-06-12 13:53:19	2025-06-15 16:28:19.767	Цифра Банк Максим М.	0.00	Беларусь витебск	500.00	\N	\N	\N
cmbxvqenv0006vd5hm6xyaap7	1236	Маначкина Зухра Викторрвна	\N	\N	shipped	5500.00	RUB	2025-06-12 10:30:43	2025-06-12 10:30:43	2025-06-15 16:28:19.77	Банк Санкт-Петербург Гульнара С.	0.00	Новосибирская обл, г Новосибирск	500.00	2025-06-13 17:00:10	2025-06-14 14:47:37	\N
cmbxvqenx0009vd5hiyuifayp	1235	Дудина Наталья Ивановна	\N	\N	shipped	6250.00	RUB	2025-06-12 08:45:48	2025-06-12 08:45:48	2025-06-15 16:28:19.772	Т-Банк Елена Ч	0.00	Кировская обл, г Киров	500.00	2025-06-12 11:49:34	2025-06-12 15:26:03	\N
cmbxvqeo0000cvd5hdevqvm6s	1234	Стромина АНАСТАСИЯ Сергеевна	\N	\N	shipped	5700.00	RUB	2025-06-12 06:54:45	2025-06-12 06:54:45	2025-06-15 16:28:19.775	Т-Банк Елена Ч	0.00	Ставропольский край, г Ставрополь	500.00	2025-06-12 11:49:29	2025-06-12 15:26:17	\N
cmbxvqeo2000fvd5hoarr79ss	1233	Быкова  Анна Николаевна	\N	\N	shipped	5500.00	RUB	2025-06-11 19:12:05	2025-06-11 19:12:05	2025-06-15 16:28:19.778	ТБАНК Эльдар А.	0.00	Курская обл, г Железногорск	500.00	2025-06-13 14:23:24	2025-06-13 14:37:35	\N
cmbxvqeo5000ivd5hds1rd84y	1232	Семичастнова Мария Александровна	\N	\N	shipped	16000.00	RUB	2025-06-11 16:31:02	2025-06-11 16:31:02	2025-06-15 16:28:19.781	ОТП БАНК Максим М.	0.00	Владимирская обл, Александровский р-н, деревня Григорово	0.00	2025-06-12 14:59:41	2025-06-12 15:25:46	\N
cmbxvqeo9000nvd5hssad3dzi	1231	Rodionova Ekaterina Петровна	\N	\N	shipped	6000.00	RUB	2025-06-11 15:50:56	2025-06-11 15:50:56	2025-06-15 16:28:19.784	ОТП БАНК Максим М.	0.00	Тверская обл, г Тверь	500.00	2025-06-11 15:56:20	2025-06-12 15:26:34	\N
cmbxvqeoa000qvd5hl1l5o17e	1230	Гордецкая Елена Сергеевна	\N	\N	shipped	5500.00	RUB	2025-06-11 13:07:24	2025-06-11 13:07:24	2025-06-15 16:28:19.786	ОТП БАНК Максим М.	0.00	г Москва, р-н Коммунарка, поселок Коммунарка	500.00	2025-06-11 13:18:47	2025-06-11 13:54:47	\N
cmbxvqeoc000tvd5hft6pmp1c	1229	Звягина Светлана  Александровна	\N	\N	overdue	6000.00	RUB	2025-06-11 12:09:00	2025-06-11 12:09:00	2025-06-15 16:28:19.787	Банк Санкт-Петербург Гульнара С.	0.00	Краснодарский край, г Краснодар	500.00	\N	\N	\N
cmbxvqeoe000wvd5h72q5iw3z	1228	Лидия Прусова Александровна	\N	\N	shipped	10400.00	RUB	2025-06-10 19:19:52	2025-06-10 19:19:52	2025-06-15 16:28:19.789	ТБАНК Эльдар А.	0.00	Московская обл, г Одинцово, г Одинцово, поселок ВНИИССОК	0.00	2025-06-10 19:40:15	2025-06-11 13:56:33	\N
cmbxvqeog000zvd5hpzmrpfxy	1227	Суханова Елена Дмитриевна	\N	\N	shipped	6500.00	RUB	2025-06-10 16:19:42	2025-06-10 16:19:42	2025-06-15 16:28:19.791	ВТБ БАНК Гульнара С.	0.00	Новосибирская обл, г Новосибирск	500.00	2025-06-10 17:06:55	2025-06-11 13:57:07	\N
cmbxvqeoi0012vd5h5uyrg0rd	1226	Василенко Наталья Александровна	\N	\N	shipped	25000.00	RUB	2025-06-10 15:20:43	2025-06-10 15:20:43	2025-06-15 16:28:19.793	ВТБ БАНК Гульнара С.	0.00	Ростовская обл, г Ростов-на-Дону	0.00	2025-06-10 19:41:40	2025-06-11 13:55:58	\N
cmbxvqeoj0015vd5h8i3an8tt	1225	Мезерный Владимир Александрович	\N	\N	shipped	11500.00	RUB	2025-06-10 15:17:36	2025-06-10 15:17:36	2025-06-15 16:28:19.795	ОТП БАНК Максим М.	0.00	Ростовская обл, г Батайск	0.00	2025-06-10 15:18:50	2025-06-10 15:39:56	\N
cmbxvqeol0018vd5h2shnc8k0	1224	Девяткина Надежда Олеговна	\N	\N	shipped	16500.00	RUB	2025-06-10 13:17:07	2025-06-10 13:17:07	2025-06-15 16:28:19.796	ВТБ БАНК Гульнара С.	0.00	Архангельская обл, г Северодвинск	0.00	2025-06-10 14:07:33	2025-06-10 15:39:30	\N
cmbxvqeon001bvd5h2su0ddv4	1223	Буранова Зарина Инсафовна 	\N	\N	shipped	6250.00	RUB	2025-06-10 11:11:13	2025-06-10 11:11:13	2025-06-15 16:28:19.798	Банк Санкт-Петербург Гульнара С.	0.00	Свердловская обл, г Екатеринбург	500.00	2025-06-10 11:17:13	2025-06-10 14:02:34	\N
cmbxvqeop001evd5hp24dhp25	1222	Овсянникова  Алина Васильевна 	\N	\N	shipped	6000.00	RUB	2025-06-10 09:07:34	2025-06-10 09:07:34	2025-06-15 16:28:19.8	ВТБ БАНК Гульнара С.	0.00	Самарская обл, г Самара, поселок Управленческий	500.00	2025-06-10 10:33:43	2025-06-10 14:03:01	\N
cmbxvqeor001hvd5hqfko0pmu	1221	Сатонкина Анастасия Юрьевна 	\N	\N	shipped	10000.00	RUB	2025-06-10 04:44:47	2025-06-10 04:44:47	2025-06-15 16:28:19.802	ВТБ БАНК Гульнара С.	0.00	Омская обл, г Омск	0.00	2025-06-11 12:46:20	2025-06-11 13:55:18	\N
cmbxvqeos001kvd5hgw94fwwr	1220	Овсепян Рипсиме Егоевна	\N	\N	shipped	6250.00	RUB	2025-06-09 23:40:32	2025-06-09 23:40:32	2025-06-15 16:28:19.804	Сбербанк Эльдар А	0.00	Ставропольский край, Шпаковский р-н, г Михайловск	500.00	2025-06-09 23:44:26	2025-06-10 14:03:39	\N
cmbxvqeou001nvd5h6daa5b60	1219	Кортунов Дмитрий Вадимович	\N	\N	shipped	23500.00	RUB	2025-06-09 22:46:32	2025-06-09 22:46:32	2025-06-15 16:28:19.805	Цифра Банк Максим М.	0.00	г Москва	0.00	2025-06-09 22:51:04	2025-06-10 14:04:14	\N
cmbxvqeoy001svd5hq0fw6g79	1218	Седова  Нурия Кешшафовна	\N	\N	shipped	9500.00	RUB	2025-06-09 18:03:25	2025-06-09 18:03:25	2025-06-15 16:28:19.809	Т-Банк Елена Ч	0.00	г Санкт-Петербург	0.00	2025-06-09 18:36:02	2025-06-10 14:04:38	\N
cmbxvqep2001zvd5hj7pu75tb	1217	Перевозникова Оксана Павловна	\N	\N	shipped	3400.00	RUB	2025-06-09 16:29:37	2025-06-09 16:29:37	2025-06-15 16:28:19.813	ОТП БАНК Максим М.	0.00	Костромская обл, г Кострома	500.00	2025-06-09 16:31:48	2025-06-10 14:05:16	\N
cmbxvqep30022vd5hzan8w7uu	1216	Шатков Данил Сергеевич	\N	\N	shipped	5700.00	RUB	2025-06-09 13:40:29	2025-06-09 13:40:29	2025-06-15 16:28:19.815	Т-Банк Елена Ч	0.00	г Санкт-Петербург, г Петергоф	500.00	2025-06-09 13:42:30	2025-06-10 14:05:43	\N
cmbxvqep50025vd5hdl031xyz	1215	Юсубов Шахлар Шакир-оглы	\N	\N	shipped	5500.00	RUB	2025-06-09 12:28:56	2025-06-09 12:28:56	2025-06-15 16:28:19.817	Т-Банк Максим М.	0.00	г Москва	500.00	2025-06-09 16:32:17	2025-06-10 14:04:57	\N
cmbxvqep70028vd5hm4nkavkk	1214	Хамцов Павел Николаевич	\N	\N	shipped	6250.00	RUB	2025-06-09 10:51:21	2025-06-09 10:51:21	2025-06-15 16:28:19.819	Сбербанк Эльдар А	0.00	г Москва	500.00	2025-06-09 11:00:31	2025-06-09 13:16:17	\N
cmbxvqep9002bvd5h6u14ma8i	1213	Королев  Кирилл Алексеевич	\N	\N	shipped	6000.00	RUB	2025-06-09 10:26:05	2025-06-09 10:26:05	2025-06-15 16:28:19.82	ВТБ БАНК Гульнара С.	0.00	г Москва	500.00	2025-06-09 12:15:18	2025-06-09 13:15:47	\N
cmbxvqepa002evd5hwxpn0qqn	1212	Смирнова Инна Викторовна	\N	\N	shipped	5500.00	RUB	2025-06-09 08:12:55	2025-06-09 08:12:55	2025-06-15 16:28:19.821	Т-Банк Елена Ч	0.00	Московская область ,го Коломна,город Озеры	500.00	2025-06-09 11:00:08	2025-06-09 13:16:37	\N
cmbxvqepc002hvd5hhvvtq3vp	1211	Плоскова Лина Натальевна	\N	\N	shipped	11500.00	RUB	2025-06-09 00:05:29	2025-06-09 00:05:29	2025-06-15 16:28:19.823	ВТБ БАНК Гульнара С.	0.00	г Санкт-Петербург	0.00	2025-06-09 12:45:41	2025-06-09 13:15:15	\N
cmbxvqepe002kvd5h7b56e7gd	1210	Хохлов Владислав Сергеевич	\N	\N	shipped	6500.00	RUB	2025-06-08 23:34:29	2025-06-08 23:34:29	2025-06-15 16:28:19.825	Сбербанк Эльдар А	0.00	г Москва	500.00	2025-06-09 00:26:29	2025-06-09 13:17:02	\N
cmbxvqepf002nvd5hbnivog6j	1209	Пузанова Евгения Егоровна	\N	\N	shipped	6000.00	RUB	2025-06-08 12:53:57	2025-06-08 12:53:57	2025-06-15 16:28:19.827	Сбербанк Эльдар А	0.00	г Москва	500.00	2025-06-08 12:57:02	2025-06-08 13:39:11	\N
cmbxvqeph002qvd5h6l4lwmss	1208	Адрианов  Дмитрий  Юрьевич 	\N	\N	shipped	13000.00	RUB	2025-06-07 19:55:09	2025-06-07 19:55:09	2025-06-15 16:28:19.829	ОТП БАНК Максим М.	0.00	Краснодарский край, г Краснодар	0.00	2025-06-07 19:58:03	2025-06-08 13:41:03	\N
cmbxvqepj002tvd5hbxu1butl	1207	Якунина Анна Александровна	\N	\N	shipped	6250.00	RUB	2025-06-07 13:50:56	2025-06-07 13:50:56	2025-06-15 16:28:19.83	ТБАНК Эльдар А.	0.00	г Москва	500.00	2025-06-07 13:56:57	2025-06-07 15:28:33	\N
cmbxvqepl002wvd5h4z3mw38l	1206	Кропоткина Мария Владиславовна 	\N	\N	shipped	5500.00	RUB	2025-06-07 11:56:03	2025-06-07 11:56:03	2025-06-15 16:28:19.832	ТБАНК Эльдар А.	0.00	г Москва	500.00	2025-06-07 13:11:44	2025-06-07 15:29:12	\N
cmbxvqepn002zvd5h3a2o2ebp	1205	Свинтинский Антон Викторович	\N	\N	shipped	5500.00	RUB	2025-06-07 09:50:40	2025-06-07 09:50:40	2025-06-15 16:28:19.834	ОТП БАНК Максим М.	0.00	г Москва	500.00	2025-06-08 14:42:00	2025-06-09 13:17:26	\N
cmbxvqepp0032vd5hyuh4thr5	1204	Артюхова Елена Алексеевна	\N	\N	shipped	10200.00	RUB	2025-06-07 07:20:09	2025-06-07 07:20:09	2025-06-15 16:28:19.836	ОТП БАНК Максим М.	0.00	Брянская обл, г Брянск	0.00	2025-06-07 13:14:55	2025-06-07 15:28:51	\N
cmbxvqepr0037vd5h00fn4vo3	1203	Светлана Конюшкова Александровна	\N	\N	shipped	6000.00	RUB	2025-06-06 23:07:58	2025-06-06 23:07:58	2025-06-15 16:28:19.838	Сбербанк Эльдар А	0.00	Московская обл, г Воскресенск, г Воскресенск, рп Хорлово	500.00	2025-06-06 23:49:48	2025-06-07 15:29:30	\N
cmbxvqept003avd5hi6vc0auy	1202	Ипатова Марина Алексеевна	\N	\N	shipped	11000.00	RUB	2025-06-06 13:36:11	2025-06-06 13:36:11	2025-06-15 16:28:19.84	Т-Банк Максим М.	0.00	г Москва	0.00	2025-06-06 13:41:34	2025-06-06 16:00:32	\N
cmbxvqepu003dvd5h9cafw20w	1201	Шевчук Павел Сергеевич	\N	\N	shipped	6250.00	RUB	2025-06-06 06:51:28	2025-06-06 06:51:28	2025-06-15 16:28:19.842	ОТП БАНК Максим М.	0.00	Новосибирская обл, г Новосибирск	500.00	2025-06-06 07:01:58	2025-06-06 16:01:04	\N
cmbxvqepw003gvd5hy2pzr3si	1068	Артюхова Елена Алексеевна	\N	\N	shipped	5700.00	RUB	2025-05-12 22:51:52	2025-05-12 22:51:52	2025-06-15 16:28:19.844	Т-Банк Елена Ч	0.00	Брянская обл, г Брянск	500.00	2025-05-12 23:09:09	2025-05-13 11:19:27	\N
cmbxvqepy003jvd5hxke15i3q	1067	Куликов Игорь Евгеньевич	\N	\N	shipped	3700.00	RUB	2025-05-12 22:24:21	2025-05-12 22:24:21	2025-06-15 16:28:19.845	Банк Санкт-Петербург Гульнара С.	0.00	Нижегородская обл, г Нижний Новгород	500.00	2025-05-12 23:09:53	2025-05-13 11:19:02	\N
cmbxvqepz003mvd5hl8k55fg7	1066	Семенова Ксения Петровна	\N	\N	shipped	6000.00	RUB	2025-05-12 21:28:32	2025-05-12 21:28:32	2025-06-15 16:28:19.847	Т-Банк Елена Ч	0.00	Краснодарский край, г Краснодар, мкр Любимово	500.00	2025-05-12 21:31:43	2025-05-13 11:20:07	\N
cmbxvqeq1003pvd5hkjcziq76	1065	Смирнова Инна Викторовна	\N	\N	shipped	5500.00	RUB	2025-05-12 18:57:11	2025-05-12 18:57:11	2025-06-15 16:28:19.848	Т-Банк Елена Ч	0.00	Московская область ,го Коломна,город Озеры	500.00	2025-05-12 19:01:52	2025-05-13 11:20:56	\N
cmbxvqeq2003svd5h4jexb7o0	1064	Земцов Денис Алексеевич	\N	\N	shipped	7000.00	RUB	2025-05-12 18:25:12	2025-05-12 18:25:12	2025-06-15 16:28:19.85	Сбербанк Эльдар А	0.00	г Москва	500.00	2025-05-12 18:26:52	2025-05-13 11:21:22	\N
cmbxvqeq4003vvd5hlhts4foh	1063	Сажина Инга Александровна	\N	\N	shipped	6500.00	RUB	2025-05-12 17:40:06	2025-05-12 17:40:06	2025-06-15 16:28:19.852	Т-Банк Максим М.	0.00	Московская обл, г Красногорск	500.00	2025-05-12 17:41:38	2025-05-13 11:21:44	\N
cmbxvqeq6003yvd5h0ddcz4kv	1062	Mирелли Mихаил Исаакович	\N	\N	shipped	11500.00	RUB	2025-05-12 17:13:22	2025-05-12 17:13:22	2025-06-15 16:28:19.853	ВТБ БАНК Максим М.	0.00	г Москва	0.00	2025-05-12 17:24:00	2025-05-13 11:22:12	\N
cmbxvqeq70041vd5hsjlzut5r	1060	Карпова  Марина Александровна 	\N	\N	shipped	6000.00	RUB	2025-05-12 09:52:31	2025-05-12 09:52:31	2025-06-15 16:28:19.855	Цифра Банк Максим М.	0.00	г Санкт-Петербург, г Кронштадт	500.00	2025-05-12 10:19:19	2025-05-12 16:01:30	\N
cmbxvqeq90044vd5hjlfjn9tf	1059	Петров Александр Александрович 	\N	\N	shipped	16500.00	RUB	2025-05-12 05:02:59	2025-05-12 05:02:59	2025-06-15 16:28:19.856	ТБАНК Эльдар А.	0.00	Новосибирская обл, г Новосибирск	0.00	2025-05-12 09:50:59	2025-05-12 16:02:07	\N
cmbxvqeqb0047vd5hc1b3ndg2	1058	Шейко Мария  Андреевна 	\N	\N	shipped	4100.00	RUB	2025-05-12 04:06:03	2025-05-12 04:06:03	2025-06-15 16:28:19.858	Сбербанк Эльдар А	0.00	Амурская обл, г Благовещенск	500.00	2025-05-14 04:43:56	2025-05-14 12:26:07	\N
cmbxvqeqc004avd5hovzc3pw1	1057	Гасанов Тимур Шевкетович	\N	\N	shipped	3500.00	RUB	2025-05-12 00:58:16	2025-05-12 00:58:16	2025-06-15 16:28:19.86	ОТП БАНК Максим М.	0.00	г Санкт-Петербург	500.00	2025-05-12 11:25:25	2025-05-12 16:00:54	\N
cmbxvqeqe004dvd5hr3cakxl9	1056	Вьюгов Вячеслав Владимирович 	\N	\N	overdue	12000.00	RUB	2025-05-11 23:34:37	2025-05-11 23:34:37	2025-06-15 16:28:19.861	ТБАНК Эльдар А.	0.00	Пермский край, г Пермь	0.00	\N	\N	\N
cmbxvqeqh004gvd5h5g1u10cb	1055	Петрик  Евгения Валерьевна 	\N	\N	shipped	5500.00	RUB	2025-05-11 18:26:30	2025-05-11 18:26:30	2025-06-15 16:28:19.864	Банк Санкт-Петербург Гульнара С.	0.00	Московская обл, г Сергиев Посад, г Сергиев Посад	500.00	2025-05-11 18:51:34	2025-05-12 16:02:55	\N
cmbxvqeqi004jvd5h4thgojqp	1054	Хохлов Владислав Сергеевич	\N	\N	shipped	7000.00	RUB	2025-05-11 17:33:30	2025-05-11 17:33:30	2025-06-15 16:28:19.866	Сбербанк Ксения Ч	0.00	г Москва	500.00	2025-05-11 18:01:05	2025-05-12 16:03:14	\N
cmbxvqeqk004mvd5h3znq33bg	1053	Rodionova Ekaterina Петровна	\N	\N	shipped	6000.00	RUB	2025-05-11 14:46:51	2025-05-11 14:46:51	2025-06-15 16:28:19.867	ВТБ БАНК Максим М.	0.00	Тверская обл, г Тверь	500.00	2025-05-11 14:51:41	2025-05-12 16:03:34	\N
cmbxvqeqm004pvd5h7rh2i34z	1052	Еремеева Алена Васильевна	\N	\N	overdue	9400.00	RUB	2025-05-11 11:29:37	2025-05-11 11:29:37	2025-06-15 16:28:19.869	Цифра Банк Максим М.	0.00	Красноярский край, г Красноярск	500.00	\N	\N	\N
cmbxvqeqr004svd5h4rffgc8l	1051	Зайцева Ольга Сергеевна	\N	\N	shipped	5500.00	RUB	2025-05-11 11:24:07	2025-05-11 11:24:07	2025-06-15 16:28:19.874	Т-Банк Максим М.	0.00	Московская обл, г Красногорск, рп Нахабино	500.00	2025-05-11 11:34:57	2025-05-11 13:53:42	\N
cmbxvqeqt004vvd5hx13ohp4b	1050	Василенко Наталья Александровна	\N	\N	cancelled	5500.00	RUB	2025-05-11 11:17:24	2025-05-11 11:17:24	2025-06-15 16:28:19.877	Т-Банк Елена Ч	0.00	Ростовская обл, г Ростов-на-Дону	500.00	\N	\N	\N
cmbxvqeqv004yvd5hryd9i2l2	1049	Василенко Наталья Александровна	\N	\N	shipped	10200.00	RUB	2025-05-11 11:06:10	2025-05-11 11:06:10	2025-06-15 16:28:19.878	Т-Банк Максим М.	0.00	Ростовская обл, г Ростов-на-Дону	0.00	2025-05-11 11:35:06	2025-05-11 13:53:16	\N
cmbxvqeqz0053vd5hp703iuxx	1048	Тимашова Алла Дмитриевна	\N	\N	shipped	15600.00	RUB	2025-05-11 10:58:22	2025-05-11 10:58:22	2025-06-15 16:28:19.883	Цифра Банк Максим М.	0.00	242650, Брянская область, пос Ивот	0.00	2025-05-11 11:34:23	2025-05-11 13:54:02	\N
cmbxvqer20056vd5hyueryrjy	1042	Девяткина Надежда Олеговна	\N	\N	shipped	6000.00	RUB	2025-05-10 22:01:27	2025-05-10 22:01:27	2025-06-15 16:28:19.885	Т-Банк Максим М.	0.00	Архангельская обл, г Северодвинск	500.00	2025-05-11 09:36:48	2025-05-11 13:54:21	\N
cmbxvqer40059vd5he2p6wkjs	1041	Мингазин  Тагир Ильдарович	\N	\N	overdue	5700.00	RUB	2025-05-10 11:34:39	2025-05-10 11:34:39	2025-06-15 16:28:19.887	Т-Банк Елена Ч	0.00	г Москва	500.00	\N	\N	\N
cmbxvqer6005cvd5h29gqxk63	1040	Хамцов Павел Николаевич	\N	\N	shipped	6000.00	RUB	2025-05-10 09:46:31	2025-05-10 09:46:31	2025-06-15 16:28:19.89	ВТБ БАНК Максим М.	0.00	г Москва	500.00	2025-05-10 09:48:30	2025-05-10 14:09:53	\N
cmbxvqer8005fvd5hqj37huoh	1039	Федченко Олеся Александровна	\N	\N	shipped	10500.00	RUB	2025-05-09 19:15:02	2025-05-09 19:15:02	2025-06-15 16:28:19.892	Цифра Банк Максим М.	0.00	Воронежская обл, г Воронеж	0.00	2025-05-09 19:17:44	2025-05-10 14:10:15	\N
cmbxvqerb005kvd5hbx37c1ul	1038	Ковалева Евгения Анатольевна	\N	\N	shipped	9800.00	RUB	2025-05-09 15:56:43	2025-05-09 15:56:43	2025-06-15 16:28:19.894	Банк Санкт-Петербург Гульнара С.	0.00	Воронежская обл, г Воронеж	0.00	2025-05-09 16:18:25	2025-05-09 16:29:49	\N
cmbxvqerd005nvd5hrr05aokz	1037	Салихова Марина  Викторовна 	\N	\N	overdue	10500.00	RUB	2025-05-09 13:56:34	2025-05-09 13:56:34	2025-06-15 16:28:19.896	Сбербанк Ксения Ч	0.00	Сахалинская обл, г Южно-Сахалинск	0.00	\N	\N	\N
cmbxvqerh005svd5hcwnnpk0j	1036	Кащенко  Владислава Вячеславовна	\N	\N	shipped	6250.00	RUB	2025-05-09 13:49:50	2025-05-09 13:49:50	2025-06-15 16:28:19.9	Цифра Банк Максим М.	0.00	Кабардино-Балкарская Респ, г Нальчик	500.00	2025-05-09 14:12:47	2025-05-09 16:18:03	\N
cmbxvqerj005vvd5hmxdg6lxw	1035	Мельников Сергей Евгеньевич	\N	\N	shipped	6000.00	RUB	2025-05-09 11:40:17	2025-05-09 11:40:17	2025-06-15 16:28:19.902	ОТП БАНК Максим М.	0.00	Ленинградская обл, Приозерский р-н, деревня Хвойное	500.00	2025-05-09 11:51:40	2025-05-09 16:18:39	\N
cmbxvqerk005yvd5hqaucqdzp	1034	Юдина Елена Александровна	\N	\N	shipped	5500.00	RUB	2025-05-09 06:17:43	2025-05-09 06:17:43	2025-06-15 16:28:19.904	Сбербанк Ксения Ч	0.00	Новосибирская обл, г Бердск	500.00	2025-05-09 12:00:00	2025-05-09 16:18:20	\N
cmbxvqerm0061vd5hrio2arg8	1033	Михайловская  Мария Сергеевна 	\N	\N	shipped	11000.00	RUB	2025-05-08 22:37:23	2025-05-08 22:37:23	2025-06-15 16:28:19.905	Т-Банк Елена Ч	0.00	г Москва	0.00	2025-05-08 22:48:09	2025-05-09 16:19:05	\N
cmbxvqero0064vd5h89e2ff2l	1032	Саразова  Юлия  Викторовна 	\N	\N	shipped	11000.00	RUB	2025-05-08 13:21:05	2025-05-08 13:21:05	2025-06-15 16:28:19.907	Сбербанк Эльдар А	0.00	Пензенская обл, г Пенза	0.00	2025-05-08 13:29:45	2025-05-08 15:32:10	\N
cmbxvqerq0067vd5h1w367wlo	1031	Дунин Антон Юрьевич 	\N	\N	shipped	10000.00	RUB	2025-05-08 11:13:51	2025-05-08 11:13:51	2025-06-15 16:28:19.909	Банк Санкт-Петербург Гульнара С.	0.00	Нижегородская обл, Павловский р-н, г Павлово	0.00	2025-05-08 11:23:08	2025-05-08 15:32:36	\N
cmbxvqers006avd5hdwk2p2ht	1030	Гусев Игорь Владимирович 	\N	\N	shipped	16000.00	RUB	2025-05-08 11:05:46	2025-05-08 11:05:46	2025-06-15 16:28:19.911	Сбербанк Эльдар А	0.00	г Санкт-Петербург	0.00	2025-05-08 11:21:20	2025-05-08 15:33:01	\N
cmbxvqeru006fvd5h0xcuxhb6	1029	Королева Лариса Николаевна 	\N	\N	overdue	25000.00	RUB	2025-05-08 07:18:52	2025-05-08 07:18:52	2025-06-15 16:28:19.913	ТБАНК Эльдар А.	0.00	Свердловская обл, г Екатеринбург	0.00	\N	\N	\N
cmbxvqerw006ivd5hdmg8kl4d	1028	Шевчук Павел Сергеевич	\N	\N	shipped	6250.00	RUB	2025-05-07 15:40:45	2025-05-07 15:40:45	2025-06-15 16:28:19.915	ТБАНК Эльдар А.	0.00	Новосибирская обл, г Новосибирск	500.00	2025-05-07 15:42:33	2025-05-07 16:01:23	\N
cmbxvqery006lvd5hilvrp6xi	1027	Шпилова  Ирина Алексеевна 	\N	\N	shipped	5700.00	RUB	2025-05-07 13:11:33	2025-05-07 13:11:33	2025-06-15 16:28:19.917	Т-Банк Елена Ч	0.00	Belgorod	500.00	2025-05-07 13:27:23	2025-05-07 16:05:06	\N
cmbxvqerz006ovd5h8dqpjweg	1026	Гасанов Тимур Шевкетович	\N	\N	overdue	4100.00	RUB	2025-05-07 11:20:33	2025-05-07 11:20:33	2025-06-15 16:28:19.919	Сбербанк Эльдар А	0.00	г Санкт-Петербург	500.00	\N	\N	\N
cmbxvqes1006rvd5hirl6n4bi	1025	Светлана Конюшкова Александровна	\N	\N	shipped	6000.00	RUB	2025-05-07 10:47:08	2025-05-07 10:47:08	2025-06-15 16:28:19.921	ТБАНК Эльдар А.	0.00	Московская обл, г Воскресенск, г Воскресенск, рп Хорлово	500.00	2025-05-07 11:55:09	2025-05-07 16:05:25	\N
cmbxvqes2006uvd5hdw4g4xnb	1024	Пушкина Ксения Сергеевна	\N	\N	shipped	5500.00	RUB	2025-05-07 07:01:27	2025-05-07 07:01:27	2025-06-15 16:28:19.922	ОТП БАНК Максим М.	0.00	Самарская обл, г Самара	500.00	2025-05-07 07:05:09	2025-05-07 16:06:04	\N
cmbxvqes4006xvd5h0018n4x2	1023	Пономаренко Анна Викторовна 	\N	\N	overdue	5500.00	RUB	2025-05-06 23:12:17	2025-05-06 23:12:17	2025-06-15 16:28:19.924	Т-Банк Максим М.	0.00	Ульяновск 	500.00	\N	\N	\N
cmbxvqes60070vd5h85gz5ff9	1022	Омельяненко Ольга Павловна	\N	\N	shipped	6250.00	RUB	2025-05-06 21:56:46	2025-05-06 21:56:46	2025-06-15 16:28:19.926	Банк Санкт-Петербург Гульнара С.	0.00	г Москва, р-н Коммунарка	500.00	2025-05-07 09:16:56	2025-05-07 16:05:45	\N
cmbxvqes80073vd5hlen226dm	1021	Черняк Артемий Михайлович	\N	\N	shipped	6000.00	RUB	2025-05-06 19:59:04	2025-05-06 19:59:04	2025-06-15 16:28:19.927	Сбербанк Эльдар А	0.00	Свердловская обл, г Екатеринбург	500.00	2025-05-07 15:40:00	2025-05-07 16:04:25	\N
cmbxvqes90076vd5hvsvc2ecr	861	Ефимов Кирилл Александрович	\N	\N	shipped	9800.00	RUB	2025-04-12 18:12:29	2025-04-12 18:12:29	2025-06-15 16:28:19.929	Т-Банк Елена Ч	0.00	г Москва	0.00	2025-04-12 18:15:54	2025-04-14 09:15:47	\N
cmbxvqesb007bvd5hiubrgtar	860	Полетаева Татьяна Вячеславовна	\N	\N	shipped	20800.00	RUB	2025-04-12 14:38:44	2025-04-12 14:38:44	2025-06-15 16:28:19.931	ВТБ БАНК Максим М.	0.00	г Москва	0.00	2025-04-12 14:41:26	2025-04-12 15:14:22	\N
cmbxvqese007gvd5hja9wi0is	859	Картошкина Людмила Вадимовна	\N	\N	overdue	5500.00	RUB	2025-04-12 13:22:13	2025-04-12 13:22:13	2025-06-15 16:28:19.934	Сбербанк Эльдар А	0.00	г Москва	500.00	\N	\N	\N
cmbxvqesg007jvd5hv8407l9o	858	Беляева Елена Сергеевна	\N	\N	shipped	6500.00	RUB	2025-04-12 12:31:10	2025-04-12 12:31:10	2025-06-15 16:28:19.935	Цифра Банк (перевод по СБП) Гульнара С.	0.00	Ростовская обл, г Гуково	500.00	2025-04-12 13:02:42	2025-04-12 15:15:03	\N
cmbxvqesh007mvd5h2m4fvlfz	857	Епишина Юлия Михайловна	\N	\N	shipped	10000.00	RUB	2025-04-12 10:41:40	2025-04-12 10:41:40	2025-06-15 16:28:19.937	Т-Банк Елена Ч	0.00	Рязанская обл, г Рязань	0.00	2025-04-12 11:05:26	2025-04-12 15:16:29	\N
cmbxvqesj007pvd5hdgzffep5	856	Жигулина  Наталья  Геннадьевна 	\N	\N	shipped	6000.00	RUB	2025-04-12 10:15:01	2025-04-12 10:15:01	2025-06-15 16:28:19.938	РОССЕЛЬХОЗБАНК Владимир С.	0.00	Московская обл, г Сергиев Посад, г Хотьково	500.00	2025-04-12 11:39:06	2025-04-12 15:15:44	\N
cmbxvqesk007svd5hww0ph5se	855	Иванова Нина Георгиевна	\N	\N	shipped	6000.00	RUB	2025-04-12 08:46:14	2025-04-12 08:46:14	2025-06-15 16:28:19.94	РОССЕЛЬХОЗБАНК Владимир С.	0.00	г Санкт-Петербург	500.00	2025-04-12 11:38:59	2025-04-12 15:16:07	\N
cmbxvqesn007vvd5hqilb965e	854	Сажина Инга Александровна	\N	\N	shipped	6500.00	RUB	2025-04-11 22:03:54	2025-04-11 22:03:54	2025-06-15 16:28:19.942	Сбербанк Эльдар А	0.00	Московская обл, г Красногорск	500.00	2025-04-11 22:20:43	2025-04-12 15:17:01	\N
cmbxvqeso007yvd5hds1yw7fu	853	Ларионова  Екатерина Евгеньевна 	\N	\N	shipped	6500.00	RUB	2025-04-11 20:52:21	2025-04-11 20:52:21	2025-06-15 16:28:19.944	РОССЕЛЬХОЗБАНК Владимир С.	0.00	г Санкт-Петербург	500.00	2025-04-11 21:36:26	2025-04-12 15:17:41	\N
cmbxvqesq0081vd5h28iki2y5	852	Кошелева Ирина Александровна 	\N	\N	shipped	6000.00	RUB	2025-04-11 19:49:49	2025-04-11 19:49:49	2025-06-15 16:28:19.945	ТБАНК Эльдар А.	0.00	г Москва	500.00	2025-04-11 19:59:19	2025-04-12 15:18:12	\N
cmbxvqesr0084vd5hlwlwe64d	851	Сарычева Людмила Андреевна	\N	\N	shipped	16500.00	RUB	2025-04-11 18:54:36	2025-04-11 18:54:36	2025-06-15 16:28:19.947	ТБАНК Эльдар А.	0.00	Рязанская обл, г Рязань	0.00	2025-04-11 18:55:53	2025-04-12 15:18:35	\N
cmbxvqess0087vd5h93536fg5	850	Халявин Егор Денисович	\N	\N	shipped	6500.00	RUB	2025-04-11 17:35:39	2025-04-11 17:35:39	2025-06-15 16:28:19.948	Сбербанк Эльдар А	0.00	г Москва	500.00	2025-04-11 17:37:07	2025-04-12 15:18:59	\N
cmbxvqesu008avd5hhukowmfs	849	Иванов Олег Александрович	\N	\N	shipped	11000.00	RUB	2025-04-11 16:27:52	2025-04-11 16:27:52	2025-06-15 16:28:19.95	Сбербанк Эльдар А	0.00	г Москва	0.00	2025-04-11 16:31:46	2025-04-12 15:19:29	\N
cmbxvqesw008dvd5hsc43og19	848	Кандаурова  Анастасия Михайловна	\N	\N	shipped	5500.00	RUB	2025-04-11 16:14:42	2025-04-11 16:14:42	2025-06-15 16:28:19.951	ОТП БАНК Максим М.	0.00	г Санкт-Петербург	500.00	2025-04-11 16:19:10	2025-04-12 15:19:56	\N
cmbxvqesx008gvd5hgmo4piwf	847	Шевчук Павел Сергеевич	\N	\N	shipped	6250.00	RUB	2025-04-11 14:34:34	2025-04-11 14:34:34	2025-06-15 16:28:19.953	ВТБ БАНК Максим М.	0.00	Новосибирская обл, г Новосибирск	500.00	2025-04-11 14:53:24	2025-04-11 16:49:23	\N
cmbxvqesz008jvd5h08l9549o	846	Пупкин  Василий  Анатольевич 	\N	\N	overdue	15000.00	RUB	2025-04-11 14:34:05	2025-04-11 14:34:05	2025-06-15 16:28:19.954	Т-Банк Елена Ч	0.00	Мурманская обл, г Мурманск	0.00	\N	\N	\N
cmbxvqet0008mvd5h49hhdszm	845	Степанова Юлия Николаевна	\N	\N	shipped	5500.00	RUB	2025-04-11 06:33:09	2025-04-11 06:33:09	2025-06-15 16:28:19.956	Цифра Банк (перевод по СБП) Гульнара С.	0.00	Респ Хакасия, Усть-Абаканский р-н, деревня Чапаево	500.00	2025-04-11 11:47:43	2025-04-11 16:50:22	\N
cmbxvqet2008pvd5hnf9lehxd	844	Михайловская  Мария Сергеевна 	\N	\N	shipped	6000.00	RUB	2025-04-10 22:01:21	2025-04-10 22:01:21	2025-06-15 16:28:19.957	Т-Банк Максим М.	0.00	г Москва	500.00	2025-04-10 22:09:52	2025-04-11 10:25:40	\N
cmbxvqet3008svd5h7sdupooj	842	Галушко Ольга Евгеньевна	\N	\N	shipped	11000.00	RUB	2025-04-10 21:22:26	2025-04-10 21:22:26	2025-06-15 16:28:19.959	РОССЕЛЬХОЗБАНК Владимир С.	0.00	г Москва	0.00	2025-04-10 21:22:55	2025-04-11 10:26:01	\N
cmbxvqet5008vvd5h2r9rfoi1	841	Грушевская Юлия Вячеславовна	\N	\N	overdue	6000.00	RUB	2025-04-10 12:39:06	2025-04-10 12:39:06	2025-06-15 16:28:19.96	РОССЕЛЬХОЗБАНК Владимир С.	0.00	Краснодарский край, г Краснодар	500.00	\N	\N	\N
cmbxvqet6008yvd5hovzrcwtz	840	Шевченко Екатерина Владимировна 	\N	\N	overdue	6250.00	RUB	2025-04-10 10:01:58	2025-04-10 10:01:58	2025-06-15 16:28:19.962	ОТП БАНК Максим М.	0.00	Самарская обл, Большечерниговский р-н, село Большая Черниговка	500.00	\N	\N	\N
cmbxvqet70091vd5h8d9iun0s	839	Кудинова  Надежда  Дмитриевна 	\N	\N	shipped	12800.00	RUB	2025-04-10 08:53:19	2025-04-10 08:53:19	2025-06-15 16:28:19.963	Цифра Банк (перевод по СБП) Гульнара С.	0.00	Красноярский край, г Красноярск	0.00	2025-04-10 12:18:25	2025-04-10 15:12:10	\N
cmbxvqeta0098vd5ht2766ceh	838	Киракозова  Светлана Арсеновна	\N	\N	shipped	10000.00	RUB	2025-04-09 20:24:02	2025-04-09 20:24:02	2025-06-15 16:28:19.966	Т-Банк Максим М.	0.00	г Москва	0.00	2025-04-09 20:42:32	2025-04-10 15:12:35	\N
cmbxvqetc009bvd5hm0747223	837	Removskaya Anna Александровна	\N	\N	shipped	10400.00	RUB	2025-04-09 15:07:28	2025-04-09 15:07:28	2025-06-15 16:28:19.967	ОТП БАНК Максим М.	0.00	г Москва	0.00	2025-04-09 15:19:56	2025-04-10 15:13:05	\N
cmbxvqetd009evd5hi2583cva	836	Ремизова Екатерина Николаевна	\N	\N	shipped	9400.00	RUB	2025-04-09 11:43:01	2025-04-09 11:43:01	2025-06-15 16:28:19.969	Т-Банк Максим М.	0.00	г Санкт-Петербург	500.00	2025-04-09 11:47:47	2025-04-10 15:13:52	\N
cmbxvqete009hvd5hxws1vzw5	835	Сологуб  Кира Вячеславовна 	\N	\N	shipped	5500.00	RUB	2025-04-09 11:05:02	2025-04-09 11:05:02	2025-06-15 16:28:19.97	Т-Банк Максим М.	0.00	г Санкт-Петербург	500.00	2025-04-09 12:40:28	2025-04-10 15:13:26	\N
cmbxvqetg009kvd5hyjn06p03	834	Акимова Олеся Александровна	\N	\N	shipped	10000.00	RUB	2025-04-09 09:36:37	2025-04-09 09:36:37	2025-06-15 16:28:19.971	Т-Банк Елена Ч	0.00	Оренбургская обл, Оренбургский р-н, село Подгородняя Покровка	0.00	2025-04-09 09:45:56	2025-04-09 11:09:59	\N
cmbxvqeth009nvd5hlwuxqk69	833	Жарова Мария Алиевна	\N	\N	shipped	7000.00	RUB	2025-04-09 09:32:28	2025-04-09 09:32:28	2025-06-15 16:28:19.973	Цифра Банк Максим М.	0.00	г Москва	500.00	2025-04-09 09:45:37	2025-04-09 11:10:20	\N
cmbxvqetj009qvd5hm1cs2yas	832	Старновская Наталья Анатольевна	\N	\N	shipped	5700.00	RUB	2025-04-09 08:06:03	2025-04-09 08:06:03	2025-06-15 16:28:19.974	Сбербанк Эльдар А	0.00	Забайкальский край, Шилкинский р-н, г Шилка	500.00	2025-04-09 09:33:49	2025-04-09 11:11:50	\N
cmbxvqetk009tvd5hmzn09aay	831	Пушкина Ксения Сергеевна	\N	\N	shipped	5500.00	RUB	2025-04-09 06:48:05	2025-04-09 06:48:05	2025-06-15 16:28:19.976	Сбербанк Эльдар А	0.00	Самарская обл, г Самара	500.00	2025-04-09 09:33:59	2025-04-09 11:11:22	\N
cmbxvqetn009wvd5hs27dds3o	830	Медведева Виктория Александовна	\N	\N	shipped	10000.00	RUB	2025-04-09 05:34:31	2025-04-09 05:34:31	2025-06-15 16:28:19.979	Цифра Банк Максим М.	0.00	Калининградская обл, г Калининград	0.00	2025-04-09 09:39:18	2025-04-09 11:10:50	\N
cmbxvqetp009zvd5ho8a6ynnc	829	Быстрицкая  Марина Александровна	\N	\N	shipped	5500.00	RUB	2025-04-08 20:31:14	2025-04-08 20:31:14	2025-06-15 16:28:19.981	Т-Банк Елена Ч	0.00	Пензенская обл, г Заречный	500.00	2025-04-08 20:34:16	2025-04-09 11:12:21	\N
cmbxvqetr00a2vd5hqjz0dg28	828	Гордецкая Елена Сергеевна	\N	\N	shipped	5500.00	RUB	2025-04-08 20:24:13	2025-04-08 20:24:13	2025-06-15 16:28:19.982	Т-Банк Елена Ч	0.00	г Москва, р-н Коммунарка, поселок Коммунарка	500.00	2025-04-08 20:27:14	2025-04-09 11:12:43	\N
cmbxvqett00a5vd5hz4e0qslg	827	Кудинова  Ульяна  Геннадьевна 	\N	\N	shipped	6000.00	RUB	2025-04-08 18:45:21	2025-04-08 18:45:21	2025-06-15 16:28:19.984	Т-Банк Максим М.	0.00	Алтайский край, г Барнаул	500.00	2025-04-08 18:47:49	2025-04-09 11:13:31	\N
cmbxvqetu00a8vd5h3xy3cfc8	825	Федорова  Алина  Владимировна 	\N	\N	shipped	11500.00	RUB	2025-04-08 16:21:33	2025-04-08 16:21:33	2025-06-15 16:28:19.986	Т-Банк Максим М.	0.00	г Москва	0.00	2025-04-08 16:25:08	2025-04-09 11:13:58	\N
cmbxvqetw00abvd5h7xnxjy3j	826	Омельяненко Ольга Павловна	\N	\N	shipped	6000.00	RUB	2025-04-08 16:07:37	2025-04-08 16:07:37	2025-06-15 16:28:19.987	ОТП БАНК Максим М.	0.00	г Москва, р-н Коммунарка	500.00	2025-04-08 19:14:08	2025-04-09 11:13:07	\N
cmbxvqety00aevd5h7gdm5yvq	822	Гареева Анастасия Ивановна	\N	\N	shipped	6000.00	RUB	2025-04-08 12:49:30	2025-04-08 12:49:30	2025-06-15 16:28:19.99	Сбербанк Эльдар А	0.00	Респ Татарстан, Альметьевский р-н, г Альметьевск	500.00	2025-04-08 13:15:21	2025-04-09 11:14:25	\N
cmbxvqeu000ahvd5h10qxeokj	824	Губанова Ирина Викторовна	\N	\N	shipped	6000.00	RUB	2025-04-08 09:00:33	2025-04-08 09:00:33	2025-06-15 16:28:19.992	Т-Банк Максим М.	0.00	Краснодарский край, г Краснодар	500.00	2025-04-08 10:42:00	2025-04-08 12:22:07	\N
cmbxvqeu200akvd5hhuikj1wx	823	Камилатова Инга Сергеевна	\N	\N	shipped	5500.00	RUB	2025-04-08 08:48:58	2025-04-08 08:48:58	2025-06-15 16:28:19.994	ОТП БАНК Максим М.	0.00	Вологодская обл, г Вологда	500.00	2025-04-08 10:41:15	2025-04-08 12:22:37	\N
cmbxvqeu400anvd5h4y7u2c65	821	Костюков Дмитрий Александрович	\N	\N	shipped	6000.00	RUB	2025-04-07 19:24:05	2025-04-07 19:24:05	2025-06-15 16:28:19.995	Банк Санкт-Петербург Гульнара С.	0.00	Московская обл, г Воскресенск, 	500.00	2025-04-07 19:28:39	2025-04-08 12:23:08	\N
cmbxvqeu600aqvd5hwcw9cw47	820	Михеева Дарья Вадимовна	\N	\N	shipped	11000.00	RUB	2025-04-07 15:58:04	2025-04-07 15:58:04	2025-06-15 16:28:19.997	Банк Санкт-Петербург Гульнара С.	0.00	Респ Марий Эл, г Йошкар-Ола	0.00	2025-04-07 18:15:27	2025-04-08 12:23:39	\N
cmbxvqeu800atvd5hp5oqd6b5	819	Еркалова  Александра Дмитриевна 	\N	\N	shipped	5500.00	RUB	2025-04-07 15:52:32	2025-04-07 15:52:32	2025-06-15 16:28:19.999	Т-Банк Максим М.	0.00	Омская обл, г Омск	500.00	2025-04-07 15:55:18	2025-04-07 16:42:45	\N
cmbxvqeua00awvd5hhq65k8wy	818	Стушнова Ирина Паатаевна	\N	\N	shipped	5500.00	RUB	2025-04-07 14:45:59	2025-04-07 14:45:59	2025-06-15 16:28:20.002	Т-Банк Елена Ч	0.00	г Москва	500.00	2025-04-07 14:49:10	2025-04-07 16:43:07	\N
cmbxvqeub00azvd5h3konnca3	817	Никитина Ирина  Юрьевна	\N	\N	shipped	10000.00	RUB	2025-04-07 13:51:53	2025-04-07 13:51:53	2025-06-15 16:28:20.003	Т-Банк Елена Ч	0.00	Камчатский край, Елизовский р-н, г Елизово	0.00	2025-04-07 13:55:50	2025-04-07 16:43:31	\N
cmbxvqeud00b2vd5hlwz8rnkc	816	Кашинцева Ирина Юрьевна	\N	\N	shipped	5500.00	RUB	2025-04-07 12:15:28	2025-04-07 12:15:28	2025-06-15 16:28:20.004	Т-Банк Елена Ч	0.00	Вологодская обл, г Вологда	500.00	2025-04-09 09:46:02	2025-04-09 11:09:33	\N
cmbxvqeuf00b5vd5hiv1i03k1	815	Белова Валентина  Владимировна	\N	\N	shipped	17300.00	RUB	2025-04-07 12:08:31	2025-04-07 12:08:31	2025-06-15 16:28:20.006	Т-Банк Елена Ч	0.00	г Москва	0.00	2025-04-07 12:11:30	2025-04-07 16:43:59	\N
cmbxvqeuj00bevd5hoa6xvcyc	814	Иванов Данил Михайлович 	\N	\N	shipped	11500.00	RUB	2025-04-07 11:20:40	2025-04-07 11:20:40	2025-06-15 16:28:20.011	ТБАНК Эльдар А.	0.00	г Санкт-Петербург	0.00	2025-04-07 12:46:48	2025-04-13 10:55:14	\N
cmbxvqeul00bhvd5hvj5ctyii	813	Бабкина Татьяна Валерьевна	\N	\N	shipped	6000.00	RUB	2025-04-07 07:51:49	2025-04-07 07:51:49	2025-06-15 16:28:20.012	РОССЕЛЬХОЗБАНК Владимир С.	0.00	Новосибирская обл, г Новосибирск	500.00	2025-04-07 10:46:34	2025-04-07 16:44:34	\N
cmbxvqeum00bkvd5hsugb8jzm	812	Максимова Лариса Юрьевна	\N	\N	shipped	6500.00	RUB	2025-04-07 00:07:30	2025-04-07 00:07:30	2025-06-15 16:28:20.014	РОССЕЛЬХОЗБАНК Владимир С.	0.00	Тульская обл, г Тула	500.00	2025-04-07 01:20:16	2025-04-07 16:46:00	\N
cmbxvqeup00bnvd5hix7hnoit	629	Гасанов Тимур Шевкетович	\N	\N	overdue	6000.00	RUB	2025-03-12 23:03:49	2025-03-12 23:03:49	2025-06-15 16:28:20.016	ОТП БАНК Максим М.	0.00	г Санкт-Петербург	500.00	\N	\N	\N
cmbxvqeur00bqvd5hmgwjmk37	619	Кренева Юлия Геннадьевна	\N	\N	shipped	6800.00	RUB	2025-03-12 20:53:15	2025-03-12 20:53:15	2025-06-15 16:28:20.018	Цифра Банк Максим М.	0.00	г Санкт-Петербург	0.00	2025-03-12 21:25:04	2025-03-13 12:41:14	\N
cmbxvqeut00bvvd5hvd53z6m7	628	Юсупова Альфия Рамазановна	\N	\N	shipped	16500.00	RUB	2025-03-12 19:05:54	2025-03-12 19:05:54	2025-06-15 16:28:20.021	Сбербанк Ксения Ч	0.00	Челябинская обл, г Челябинск	0.00	2025-03-12 19:10:39	2025-03-13 12:42:00	\N
cmbxvqeuv00byvd5h4wcin2rw	627	Малыхин Андрей Юрьевич	\N	\N	shipped	5500.00	RUB	2025-03-12 15:44:51	2025-03-12 15:44:51	2025-06-15 16:28:20.022	Цифра Банк Максим М.	0.00	г Москва	500.00	2025-03-12 15:48:53	2025-03-12 16:24:14	\N
cmbxvqeux00c1vd5h57agz3kh	626	Наместникова Ольга Федоровна	\N	\N	shipped	5500.00	RUB	2025-03-12 14:23:48	2025-03-12 14:23:48	2025-06-15 16:28:20.025	Цифра Банк Максим М.	0.00	Чувашская республика - Чувашия, г Чебоксары	500.00	2025-03-12 14:28:36	2025-03-12 16:24:39	\N
cmbxvqeuz00c4vd5hsiepdran	625	Федорова  Алина  Владимировна 	\N	\N	shipped	11250.00	RUB	2025-03-12 13:57:17	2025-03-12 13:57:17	2025-06-15 16:28:20.027	Сбербанк Эльдар А	0.00	г Москва	0.00	2025-03-13 21:18:09	2025-03-14 15:04:41	\N
cmbxvqev100c9vd5h8kri0832	624	Звягина Рузанна Размиковна	\N	\N	shipped	6000.00	RUB	2025-03-12 12:37:57	2025-03-12 12:37:57	2025-06-15 16:28:20.029	Сбербанк Эльдар А	0.00	Краснодарский край, г Краснодар	500.00	2025-03-12 12:39:50	2025-03-12 16:25:03	\N
cmbxvqev300ccvd5h5r728nhx	623	Лисовец Виктория Евгеньевна	\N	\N	shipped	5700.00	RUB	2025-03-12 10:50:03	2025-03-12 10:50:03	2025-06-15 16:28:20.031	Сбербанк Эльдар А	0.00	г Москва	500.00	2025-03-12 14:07:40	2025-03-12 15:48:56	\N
cmbxvqev700cfvd5hu3l62txu	622	Кормщикова  Светлана Витальевна 	\N	\N	shipped	10500.00	RUB	2025-03-12 10:48:34	2025-03-12 10:48:34	2025-06-15 16:28:20.034	Сбербанк Эльдар А	0.00	Пермский край, г Пермь	0.00	2025-03-12 11:21:17	2025-03-12 16:25:53	\N
cmbxvqeva00ckvd5h1gyb678u	621	Шевчук Павел Сергеевич	\N	\N	shipped	6250.00	RUB	2025-03-12 07:08:59	2025-03-12 07:08:59	2025-06-15 16:28:20.037	Сбербанк Эльдар А	0.00	Новосибирская обл, г Новосибирск	500.00	2025-03-12 11:21:24	2025-03-12 16:25:30	\N
cmbxvqevc00cnvd5h6osj9636	620	Гусь Наталья Анатольевна	\N	\N	shipped	10000.00	RUB	2025-03-12 01:26:37	2025-03-12 01:26:37	2025-06-15 16:28:20.039	ВТБ БАНК Максим М.	0.00	Москва	0.00	2025-03-12 04:53:51	2025-03-12 16:26:17	\N
cmbxvqeve00cqvd5hcu3l6z6s	618	Нозик Юля Сергеевна 	\N	\N	shipped	10200.00	RUB	2025-03-11 18:39:18	2025-03-11 18:39:18	2025-06-15 16:28:20.041	Сбербанк Ксения Ч	0.00	Ярославская обл, г Ярославль	0.00	2025-03-11 18:45:45	2025-03-12 15:50:32	\N
cmbxvqevh00cvvd5h6dh1j85g	617	Фазылова (Дибаева) Гузель Фанилевна 	\N	\N	overdue	5500.00	RUB	2025-03-11 17:12:01	2025-03-11 17:12:01	2025-06-15 16:28:20.044	Сбербанк Эльдар А	0.00	Респ Башкортостан, г Уфа	500.00	\N	\N	\N
cmbxvqevj00cyvd5hjyu0f75f	616	Вожга Наталья Петровна	\N	\N	shipped	11000.00	RUB	2025-03-11 12:40:36	2025-03-11 12:40:36	2025-06-15 16:28:20.046	Цифра Банк Максим М.	0.00	г Москва	0.00	2025-03-11 13:52:49	2025-03-11 13:53:27	\N
cmbxvqevk00d1vd5hklhih7us	608	Глоба Анастасия Александровна	\N	\N	shipped	10000.00	RUB	2025-03-11 10:25:37	2025-03-11 10:25:37	2025-06-15 16:28:20.048	ВТБ БАНК Максим М.	0.00	Свердловская обл, г Екатеринбург	0.00	2025-03-11 10:30:03	2025-03-11 13:54:12	\N
cmbxvqevn00d4vd5h8u3kvqpi	615	Дмитревская Екатерина Юрьевна	\N	\N	shipped	5500.00	RUB	2025-03-11 08:36:29	2025-03-11 08:36:29	2025-06-15 16:28:20.05	Сбербанк Эльдар А	0.00	Челябинская обл, г Челябинск	500.00	2025-03-11 08:38:41	2025-03-11 13:45:01	\N
cmbxvqevp00d7vd5h4gsoxca0	614	Киракозова  Светлана Арсеновна	\N	\N	shipped	10000.00	RUB	2025-03-11 00:50:15	2025-03-11 00:50:15	2025-06-15 16:28:20.052	Сбербанк Эльдар А	0.00	г Москва	0.00	2025-03-11 00:50:46	2025-03-11 13:45:56	\N
cmbxvqevq00davd5hevsejsa6	613	Гасенчикова  Татьяна Владимировна 	\N	\N	shipped	5700.00	RUB	2025-03-11 00:49:31	2025-03-11 00:49:31	2025-06-15 16:28:20.054	Цифра Банк Максим М.	0.00	Камчатский край, г Петропавловск-Камчатский	500.00	2025-03-11 05:40:37	2025-03-11 13:45:31	\N
cmbxvqevs00ddvd5hj90c1ulk	612	Иванов Иван Иванович	\N	\N	cancelled	49100.00	RUB	2025-03-11 00:45:25	2025-03-11 00:45:25	2025-06-15 16:28:20.055	ОТП БАНК Максим М.	0.00	г Москва	0.00	\N	\N	\N
cmbxvqevy00dovd5hf48my92d	611	Киракозова  Светлана Арсеновна	\N	\N	cancelled	10000.00	RUB	2025-03-10 23:50:04	2025-03-10 23:50:04	2025-06-15 16:28:20.061	ОТП БАНК Максим М.	0.00	г Москва	0.00	2025-03-10 23:52:19	\N	\N
cmbxvqew100dtvd5h61yp2vhd	610	Киракозова  Светлана Арсеновна	\N	\N	cancelled	10000.00	RUB	2025-03-10 19:22:04	2025-03-10 19:22:04	2025-06-15 16:28:20.064	ВТБ БАНК Максим М.	0.00	г Москва	0.00	2025-03-10 19:23:57	\N	\N
cmbxvqew300dwvd5hwc6lozl2	609	Стромина АНАСТАСИЯ Сергеевна	\N	\N	shipped	5700.00	RUB	2025-03-10 18:40:50	2025-03-10 18:40:50	2025-06-15 16:28:20.066	ОТП БАНК Максим М.	0.00	Ставропольский край, г Ставрополь	500.00	2025-03-10 18:45:22	2025-03-11 13:46:19	\N
cmbxvqew500dzvd5hyxm5jark	607	Панкратова  Анна  Сергеевна 	\N	\N	overdue	10000.00	RUB	2025-03-10 15:05:02	2025-03-10 15:05:02	2025-06-15 16:28:20.068	Т-Банк Елена Ч	0.00	Ленинградская обл, Всеволожский р-н, г Сертолово, мкр Сертолово-1	0.00	\N	\N	\N
cmbxvqew600e2vd5h0u92ofas	606	Корсеева Наталья Александровна	\N	\N	shipped	6000.00	RUB	2025-03-10 12:13:33	2025-03-10 12:13:33	2025-06-15 16:28:20.07	ОТП БАНК Максим М.	0.00	Курганская обл, Шумихинский р-н, г Шумиха	500.00	2025-03-10 15:42:30	2025-03-11 13:46:44	\N
cmbxvqew800e5vd5hrw01ez5m	605	Хохлов Владислав Сергеевич	\N	\N	shipped	6500.00	RUB	2025-03-10 08:27:20	2025-03-10 08:27:20	2025-06-15 16:28:20.071	Цифра Банк Максим М.	0.00	г Москва	500.00	2025-03-10 08:28:54	2025-03-10 13:29:52	\N
cmbxvqewb00e8vd5hytiypo71	604	Белозерцева Нина Александровна	\N	\N	shipped	10000.00	RUB	2025-03-09 18:50:39	2025-03-09 18:50:39	2025-06-15 16:28:20.074	ОТП БАНК Максим М.	0.00	Самарская обл, г Самара	0.00	2025-03-09 19:08:20	2025-03-10 13:30:14	\N
cmbxvqewd00ebvd5hbmyux0tg	603	Баёва Анастасия Николаевна	\N	\N	shipped	6000.00	RUB	2025-03-09 16:54:59	2025-03-09 16:54:59	2025-06-15 16:28:20.076	Т-Банк Максим М.	0.00	Тюменская обл, г Тюмень	500.00	2025-03-09 17:05:55	2025-03-10 13:30:38	\N
cmbxvqewf00eevd5hzacdaikd	602	Заварзина Наталья Сергеевна	\N	\N	shipped	6000.00	RUB	2025-03-09 16:26:38	2025-03-09 16:26:38	2025-06-15 16:28:20.078	ВТБ БАНК Максим М.	0.00	Рязанская обл, г Рязань	500.00	2025-03-09 16:29:25	2025-03-10 13:30:59	\N
cmbxvqewg00ehvd5hu9f9l5sr	601	Алексахин Егор Андреевич	\N	\N	shipped	10750.00	RUB	2025-03-09 14:44:31	2025-03-09 14:44:31	2025-06-15 16:28:20.08	Т-Банк Максим М.	0.00	г Москва	0.00	2025-03-09 14:45:52	2025-03-10 13:31:27	\N
cmbxvqewj00emvd5h63o7hkoz	600	Новинская Ольга Николаевна 	\N	\N	shipped	5400.00	RUB	2025-03-08 11:37:34	2025-03-08 11:37:34	2025-06-15 16:28:20.082	Сбербанк Ксения Ч	0.00	Нижегородская обл, г Нижний Новгород	500.00	2025-03-08 11:57:44	2025-03-08 13:24:53	\N
cmbxvqewl00epvd5homquexnr	599	Богомягкова Юлия Вячеславовна	\N	\N	shipped	6000.00	RUB	2025-03-08 10:19:34	2025-03-08 10:19:34	2025-06-15 16:28:20.085	ОТП БАНК Максим М.	0.00	г Санкт-Петербург	500.00	2025-03-08 11:04:33	2025-03-08 19:19:13	\N
cmbxvqewn00esvd5hz58w10wc	598	Дивес Евангелина Глебовна	\N	\N	shipped	6250.00	RUB	2025-03-07 20:38:34	2025-03-07 20:38:34	2025-06-15 16:28:20.087	Т-Банк Елена Ч	0.00	Калининградская обл, г Калининград	500.00	2025-03-07 21:36:16	2025-03-08 13:25:46	\N
cmbxvqewp00evvd5ho2krsmtf	597	ᅠКлименко ᅠ ᅠДанил Денисович	\N	\N	shipped	6000.00	RUB	2025-03-07 20:02:04	2025-03-07 20:02:04	2025-06-15 16:28:20.088	Сбербанк Ксения Ч	0.00	г Москва	500.00	2025-03-07 20:07:22	2025-03-08 13:26:10	\N
cmbxvqewr00eyvd5h6c7p66zz	596	Наталья Маркова Андреевна	\N	\N	shipped	6000.00	RUB	2025-03-07 15:21:01	2025-03-07 15:21:01	2025-06-15 16:28:20.09	Сбербанк Ксения Ч	0.00	г Санкт-Петербург, поселок Шушары	500.00	2025-03-07 16:00:29	2025-03-08 13:26:33	\N
cmbxvqewt00f1vd5hdrtsfou9	594	Зайцев Vitaly Григорьеаич	\N	\N	shipped	6500.00	RUB	2025-03-07 14:48:15	2025-03-07 14:48:15	2025-06-15 16:28:20.092	Т-Банк Максим М.	0.00	Московская обл, г Красногорск	500.00	2025-03-07 14:55:01	2025-03-08 13:27:03	\N
cmbxvqewv00f4vd5h4sgtlg0k	595	Нелипа Екатерина Николаевна	\N	\N	shipped	11500.00	RUB	2025-03-07 14:09:56	2025-03-07 14:09:56	2025-06-15 16:28:20.094	ВТБ БАНК Максим М.	0.00	Волгоградская обл, г Волгоград	0.00	2025-03-07 14:20:49	2025-03-08 13:27:24	\N
cmbxvqeww00f7vd5h1jqze5d8	593	Майдо  Эйрина  Владимировна 	\N	\N	overdue	6000.00	RUB	2025-03-07 11:25:31	2025-03-07 11:25:31	2025-06-15 16:28:20.096	Т-Банк Елена Ч	0.00	Калининградская обл, г Калининград	500.00	\N	\N	\N
cmbxvqewy00favd5hpjihh9fw	592	Смирнова Ольга Рудольфовна	\N	\N	shipped	19600.00	RUB	2025-03-07 10:16:52	2025-03-07 10:16:52	2025-06-15 16:28:20.098	Т-Банк Максим М.	0.00	г Москва	0.00	2025-03-07 10:23:46	2025-03-07 13:58:54	\N
cmbxvqex000fdvd5hn15wrryh	591	Мампория Даниил Автандилович	\N	\N	shipped	6250.00	RUB	2025-03-07 02:50:10	2025-03-07 02:50:10	2025-06-15 16:28:20.1	Т-Банк Елена Ч	0.00	г Санкт-Петербург	500.00	2025-03-07 02:58:27	2025-03-07 13:59:18	\N
cmbxvqex200fgvd5hsbbbzobk	441	Анкудинов Сергей Анатольевич	\N	\N	overdue	5500.00	RUB	2025-02-12 21:17:55	2025-02-12 21:17:55	2025-06-15 16:28:20.101	\N	0.00	Курганская обл, г Курган	500.00	\N	\N	\N
cmbxvqex400fjvd5h1zryga15	440	Rodionova Ekaterina Петровна	\N	\N	shipped	6000.00	RUB	2025-02-12 15:29:40	2025-02-12 15:29:40	2025-06-15 16:28:20.103	\N	0.00	Тверская обл, г Тверь	500.00	2025-02-12 14:13:53	2025-02-13 14:13:53	\N
cmbxvqex500fmvd5hp5do0wy4	439	Kalinina Elena Станиславовна 	\N	\N	shipped	6000.00	RUB	2025-02-12 14:59:36	2025-02-12 14:59:36	2025-06-15 16:28:20.105	\N	0.00	г Москва	500.00	2025-02-12 14:14:09	2025-02-13 14:14:09	\N
cmbxvqex700fpvd5hb98yoeo7	438	Смелова Ольга Викторовна	\N	\N	shipped	5500.00	RUB	2025-02-12 13:52:43	2025-02-12 13:52:43	2025-06-15 16:28:20.106	\N	0.00	г Москва	500.00	2025-02-13 10:25:14	2025-02-13 14:13:20	\N
cmbxvqex800fsvd5hjo1rdw1l	437	Королева Лариса Николаевна 	\N	\N	overdue	35000.00	RUB	2025-02-12 12:17:56	2025-02-12 12:17:56	2025-06-15 16:28:20.108	\N	0.00	Свердловская обл, г Екатеринбург	0.00	\N	\N	\N
cmbxvqexa00fvvd5hllk6p71l	436	Терехова Elena Викторовна	\N	\N	shipped	5500.00	RUB	2025-02-12 12:00:43	2025-02-12 12:00:43	2025-06-15 16:28:20.11	\N	0.00	г Москва	500.00	2025-02-11 12:43:44	2025-02-12 12:43:44	\N
cmbxvqexc00fyvd5h6jfct17v	435	Бирюкова  Галина Викторовна 	\N	\N	shipped	6000.00	RUB	2025-02-12 09:02:11	2025-02-12 09:02:11	2025-06-15 16:28:20.111	\N	0.00	Рязанская обл, Ряжский р-н, г Ряжск	500.00	2025-02-11 12:44:22	2025-02-12 12:44:22	\N
cmbxvqexd00g1vd5hbh4sk083	434	Беспалова Юлия Владимировна	\N	\N	shipped	10000.00	RUB	2025-02-12 08:51:27	2025-02-12 08:51:27	2025-06-15 16:28:20.113	\N	0.00	Новосибирская обл, г Новосибирск	0.00	2025-02-11 12:44:03	2025-02-12 12:44:03	\N
cmbxvqexg00g4vd5ha1fllwet	433	Купреева Ксения Дмитриевна	\N	\N	shipped	6000.00	RUB	2025-02-12 08:48:33	2025-02-12 08:48:33	2025-06-15 16:28:20.114	\N	0.00	Челябинская обл, г Челябинск	500.00	2025-02-11 12:45:12	2025-02-12 12:45:12	\N
cmbxvqexi00g7vd5hbj71zdyv	432	Петров Александр Александрович 	\N	\N	shipped	11000.00	RUB	2025-02-12 04:35:39	2025-02-12 04:35:39	2025-06-15 16:28:20.117	\N	0.00	Новосибирская обл, г Новосибирск	0.00	2025-02-11 12:45:38	2025-02-12 12:45:38	\N
cmbxvqexk00gavd5hadz65d3c	430	Саппарова  Гузалия Булатовна	\N	\N	shipped	10000.00	RUB	2025-02-11 20:20:36	2025-02-11 20:20:36	2025-06-15 16:28:20.119	\N	0.00	Ульяновская обл, г Ульяновск	0.00	2025-02-11 12:46:12	2025-02-12 12:46:12	\N
cmbxvqexl00gdvd5htiuq6ac8	428	Дон Цаган Антоновна	\N	\N	shipped	3600.00	RUB	2025-02-11 15:00:21	2025-02-11 15:00:21	2025-06-15 16:28:20.121	\N	0.00	г Санкт-Петербург	0.00	2025-02-11 12:46:34	2025-02-12 12:46:34	\N
cmbxvqexn00ggvd5hct2caupm	427	Тиренко Елена Анатольевна	\N	\N	cancelled	5500.00	RUB	2025-02-11 14:45:50	2025-02-11 14:45:50	2025-06-15 16:28:20.122	\N	0.00	Омская обл, г Омск	500.00	\N	\N	\N
cmbxvqexo00gjvd5h97gcm7wv	426	Евтеева  Олеся  Геннадьевна 	\N	\N	shipped	10500.00	RUB	2025-02-11 14:37:36	2025-02-11 14:37:36	2025-06-15 16:28:20.124	\N	0.00	Московская обл, г Егорьевск	0.00	2025-02-11 12:47:02	2025-02-12 12:47:02	\N
cmbxvqexr00govd5h03wu0ege	425	Ларионова Ирина Владимировна	\N	\N	shipped	5400.00	RUB	2025-02-11 14:22:08	2025-02-11 14:22:08	2025-06-15 16:28:20.127	\N	0.00	Саратовская обл, Романовский р-н, рп Романовка	500.00	2025-02-10 14:55:01	2025-02-11 14:55:01	\N
cmbxvqexs00grvd5hks7nsoc0	424	Просвирина Ирина Анатольевна 	\N	\N	shipped	15000.00	RUB	2025-02-11 14:22:01	2025-02-11 14:22:01	2025-06-15 16:28:20.128	\N	0.00	Алтайский край, г Барнаул	0.00	2025-02-10 14:54:40	2025-02-11 14:54:40	\N
cmbxvqexu00guvd5hn0wxih8y	422	Степанова Юлия Николаевна	\N	\N	shipped	5500.00	RUB	2025-02-11 14:02:12	2025-02-11 14:02:12	2025-06-15 16:28:20.129	\N	0.00	Респ Хакасия, Усть-Абаканский р-н, деревня Чапаево	500.00	2025-02-10 14:55:42	2025-02-11 14:55:42	\N
cmbxvqexw00gxvd5hnxosw8gk	421	Саразова  Юлия  Викторовна 	\N	\N	shipped	5500.00	RUB	2025-02-11 14:01:59	2025-02-11 14:01:59	2025-06-15 16:28:20.131	\N	0.00	Пензенская обл, г Пенза	500.00	2025-02-10 14:55:19	2025-02-11 14:55:19	\N
cmbxvqexy00h0vd5hkxljqb5j	420	Глоба Анастасия Александровна	\N	\N	shipped	6000.00	RUB	2025-02-11 13:19:11	2025-02-11 13:19:11	2025-06-15 16:28:20.133	\N	0.00	Свердловская обл, г Екатеринбург	500.00	2025-02-10 14:56:00	2025-02-11 14:56:00	\N
cmbxvqey000h3vd5h62dtt8hw	419	Маисеева😘 Екатерина Александровна	\N	\N	shipped	10400.00	RUB	2025-02-11 08:36:25	2025-02-11 08:36:25	2025-06-15 16:28:20.135	\N	0.00	Хабаровский край, г Хабаровск	0.00	2025-02-10 12:03:43	2025-02-11 12:03:43	\N
cmbxvqey200h6vd5hzjh5ke9f	418	Медведева Наталья Евгеньевна 	\N	\N	shipped	9800.00	RUB	2025-02-11 01:21:27	2025-02-11 01:21:27	2025-06-15 16:28:20.137	\N	0.00	г Санкт-Петербург	0.00	2025-02-10 12:04:27	2025-02-11 12:04:27	\N
cmbxvqey600h9vd5h1842ayt1	417	Солодовникова Aнастасия Сергеевна	\N	\N	overdue	5700.00	RUB	2025-02-10 15:47:11	2025-02-10 15:47:11	2025-06-15 16:28:20.142	\N	0.00	г Санкт-Петербург	500.00	\N	\N	\N
cmbxvqey800hcvd5hi94zarvo	416	Джоракулыева Татьяна Сергеевна	\N	\N	shipped	6250.00	RUB	2025-02-10 14:46:48	2025-02-10 14:46:48	2025-06-15 16:28:20.143	\N	0.00	Пензенская обл, г Пенза	500.00	2025-02-10 12:05:06	2025-02-11 12:05:06	\N
cmbxvqeya00hfvd5hou9azn49	415	Шевчук Павел Сергеевич	\N	\N	shipped	6250.00	RUB	2025-02-10 13:45:47	2025-02-10 13:45:47	2025-06-15 16:28:20.145	\N	0.00	Новосибирская обл, г Новосибирск	500.00	2025-02-10 12:05:43	2025-02-11 12:05:43	\N
cmbxvqeyb00hivd5hiau81trb	414	Скрипченко Вера Александровна	\N	\N	shipped	6000.00	RUB	2025-02-10 13:04:31	2025-02-10 13:04:31	2025-06-15 16:28:20.147	\N	0.00	Иркутская обл, г Нижнеудинск	500.00	2025-02-10 12:04:49	2025-02-11 12:04:49	\N
cmbxvqeyd00hlvd5h0fom6ouq	413	Савина Ольга Андреевна	\N	\N	shipped	11500.00	RUB	2025-02-10 12:19:52	2025-02-10 12:19:52	2025-06-15 16:28:20.148	\N	0.00	Ханты-Мансийский Автономный округ - Югра, г Сургут	0.00	2025-02-22 11:29:17	2025-02-22 12:34:31	\N
cmbxvqeyf00hovd5hxn68ue7w	412	Хохлов Владислав Сергеевич	\N	\N	shipped	6250.00	RUB	2025-02-10 07:32:37	2025-02-10 07:32:37	2025-06-15 16:28:20.15	\N	0.00	г Москва	500.00	2025-02-09 13:26:22	2025-02-10 13:26:22	\N
cmbxvqeyg00hrvd5hzq1cjmkm	411	Дивасанова Дынсыма Ходоктуевна	\N	\N	shipped	6000.00	RUB	2025-02-10 06:37:34	2025-02-10 06:37:34	2025-06-15 16:28:20.152	\N	0.00	Респ Бурятия, Кижингинский р-н, улус Эдэрмэг	500.00	2025-02-09 13:26:07	2025-02-10 13:26:07	\N
cmbxvqeyi00huvd5hd69q56i7	410	Кортунов Дмитрий Вадимович	\N	\N	shipped	16750.00	RUB	2025-02-09 23:51:36	2025-02-09 23:51:36	2025-06-15 16:28:20.153	\N	0.00	г Москва	0.00	2025-02-09 13:26:41	2025-02-10 13:26:41	\N
cmbxvqeyk00hzvd5hbrf7nmgn	409	Пантюшина Татьяна Сергеевна	\N	\N	shipped	11500.00	RUB	2025-02-09 18:18:09	2025-02-09 18:18:09	2025-06-15 16:28:20.155	\N	0.00	Самарская обл, Волжский р-н, тер Яицкое жилой массив (село Лопатино)	0.00	2025-02-09 13:26:59	2025-02-10 13:26:59	\N
cmbxvqeyl00i2vd5h06v1pqss	408	Сокольникова  Людмила Эдуардовна	\N	\N	shipped	11000.00	RUB	2025-02-09 12:19:55	2025-02-09 12:19:55	2025-06-15 16:28:20.157	\N	0.00	Белгородская обл, г Белгород	0.00	2025-02-08 13:44:48	2025-02-09 13:44:48	\N
cmbxvqeyn00i5vd5h51i5dlwx	407	Тимашова Алла Дмитриевна	\N	\N	shipped	5700.00	RUB	2025-02-09 08:52:17	2025-02-09 08:52:17	2025-06-15 16:28:20.159	\N	0.00	242650, Брянская область, пос Ивот	500.00	2025-02-08 13:45:30	2025-02-09 13:45:30	\N
cmbxvqeyp00i8vd5hb83atvu5	406	Авасев Даниил Сергеевич	\N	\N	shipped	10700.00	RUB	2025-02-09 03:21:28	2025-02-09 03:21:28	2025-06-15 16:28:20.161	\N	0.00	108838г.Москва  	0.00	2025-02-08 13:45:12	2025-02-09 13:45:12	\N
cmbxvqeys00idvd5hpesa3oy2	405	Ефремова Наталья Александровна 	\N	\N	shipped	6000.00	RUB	2025-02-08 18:36:09	2025-02-08 18:36:09	2025-06-15 16:28:20.164	\N	0.00	Кемеровская область - Кузбасс, г Новокузнецк, р-н Новоильинский	500.00	2025-02-08 13:45:45	2025-02-09 13:45:45	\N
cmbxvqeyu00igvd5hxl026azq	404	Наталья Орлова Юрьевна	\N	\N	shipped	16500.00	RUB	2025-02-08 17:07:30	2025-02-08 17:07:30	2025-06-15 16:28:20.166	\N	0.00	Московская обл, г Домодедово, мкр Западный	0.00	2025-02-08 13:46:01	2025-02-09 13:46:01	\N
cmbxvqeyw00ijvd5h2zhw8mr9	403	Гончарова Кристина Александровна	\N	\N	overdue	6000.00	RUB	2025-02-08 17:02:37	2025-02-08 17:02:37	2025-06-15 16:28:20.168	\N	0.00	г Москва	500.00	\N	\N	\N
cmbxvqeyy00imvd5h2pzljz46	402	Добровская Алеся Сергеевна	\N	\N	shipped	6000.00	RUB	2025-02-07 23:18:37	2025-02-07 23:18:37	2025-06-15 16:28:20.17	\N	0.00	Мурманская обл, г Снежногорск	500.00	2025-02-07 12:28:30	2025-02-08 12:28:30	\N
cmbxvqez000ipvd5hzepd3rr6	401	Баранов Дмитрий Сергеевич	\N	\N	shipped	6000.00	RUB	2025-02-07 20:23:46	2025-02-07 20:23:46	2025-06-15 16:28:20.171	\N	0.00	Московская обл, г Подольск, тер СНТ ПЭМЗ-1	500.00	2025-02-07 12:28:50	2025-02-08 12:28:50	\N
cmbxvqez200isvd5h60c7bkak	400	Стромина АНАСТАСИЯ Сергеевна	\N	\N	shipped	5700.00	RUB	2025-02-07 20:16:17	2025-02-07 20:16:17	2025-06-15 16:28:20.173	\N	0.00	Ставропольский край, г Ставрополь	500.00	2025-02-07 12:29:04	2025-02-08 12:29:04	\N
cmbxvqez400ivvd5hmzuoccz4	399	Иванов Данил Михайлович 	\N	\N	shipped	11500.00	RUB	2025-02-07 18:46:36	2025-02-07 18:46:36	2025-06-15 16:28:20.175	\N	0.00	г Санкт-Петербург	0.00	2025-02-09 19:57:59	2025-02-10 19:57:59	\N
cmbxvqez500iyvd5hy8mfsw82	398	Наталья Маркова Андреевна	\N	\N	shipped	6000.00	RUB	2025-02-07 15:53:47	2025-02-07 15:53:47	2025-06-15 16:28:20.177	\N	0.00	г Санкт-Петербург, поселок Шушары	500.00	2025-02-07 12:29:18	2025-02-08 12:29:18	\N
cmbxvqez700j1vd5huxm5gipg	397	Сатонкина Анастасия Юрьевна 	\N	\N	shipped	5500.00	RUB	2025-02-07 10:18:42	2025-02-07 10:18:42	2025-06-15 16:28:20.179	\N	0.00	Омская обл, г Омск	500.00	2025-02-06 14:17:33	2025-02-07 14:17:33	\N
cmbxvqez900j4vd5hzfy0zjz9	274	Зайцева Ольга Сергеевна	\N	\N	shipped	6400.00	RUB	2025-01-12 23:47:39	2025-01-12 23:47:39	2025-06-15 16:28:20.18	\N	0.00	Московская обл, г Красногорск, рп Нахабино	500.00	2025-01-14 13:02:10	2025-01-15 13:02:10	\N
cmbxvqeza00j7vd5hwbc5s9ta	273	Bilalov Bilal Magomedovich	\N	\N	overdue	6000.00	RUB	2025-01-12 18:28:44	2025-01-12 18:28:44	2025-06-15 16:28:20.182	\N	0.00	г Москва	500.00	\N	\N	\N
cmbxvqezc00javd5hma5js05c	272	Олейник Анастасия Юрьевна	\N	\N	overdue	6000.00	RUB	2025-01-12 17:13:39	2025-01-12 17:13:39	2025-06-15 16:28:20.184	\N	0.00	г Москва	500.00	\N	\N	\N
cmbxvqeze00jdvd5hav51zhf9	271	Маляревич  Елена  Васильевна 	\N	\N	shipped	11000.00	RUB	2025-01-12 13:09:20	2025-01-12 13:09:20	2025-06-15 16:28:20.185	\N	0.00	Ленинградская обл, Всеволожский р-н, г Мурино	0.00	2025-01-12 14:00:59	2025-01-13 14:00:59	\N
cmbxvqezf00jgvd5hh9fhpy29	270	Эбзеева Ира Николаевна	\N	\N	shipped	5700.00	RUB	2025-01-11 23:34:55	2025-01-11 23:34:55	2025-06-15 16:28:20.187	\N	0.00	г Санкт-Петербург	500.00	2025-01-12 16:10:02	2025-01-13 16:10:02	\N
cmbxvqezh00jjvd5hstihs5cs	269	Мишенина Ольга Леонидовна	\N	\N	shipped	10700.00	RUB	2025-01-11 23:26:41	2025-01-11 23:26:41	2025-06-15 16:28:20.188	\N	0.00	г Москва	0.00	2025-01-12 14:01:28	2025-01-13 14:01:28	\N
cmbxvqezk00jovd5hsyuvmycz	268	Kalinina Elena Станиславовна 	\N	\N	shipped	6000.00	RUB	2025-01-11 20:48:36	2025-01-11 20:48:36	2025-06-15 16:28:20.191	\N	0.00	г Москва	500.00	2025-01-12 14:01:54	2025-01-13 14:01:54	\N
cmbxvqezl00jrvd5hqje3avsf	267	Малахова Наталья Юрьевна	\N	\N	cancelled	6000.00	RUB	2025-01-11 20:37:51	2025-01-11 20:37:51	2025-06-15 16:28:20.193	\N	0.00	Московская обл, г Красногорск	500.00	\N	\N	\N
cmbxvqezn00juvd5hhn3jm6f0	266	Джоракулыева Татьяна Сергеевна	\N	\N	overdue	6250.00	RUB	2025-01-11 17:41:04	2025-01-11 17:41:04	2025-06-15 16:28:20.195	\N	0.00	Пензенская обл, г Пенза	500.00	\N	\N	\N
cmbxvqezp00jxvd5hmx8420ij	265	Саразова  Юлия  Викторовна 	\N	\N	shipped	5500.00	RUB	2025-01-11 15:53:01	2025-01-11 15:53:01	2025-06-15 16:28:20.196	\N	0.00	Пензенская обл, г Пенза	500.00	2025-01-12 14:02:42	2025-01-13 14:02:42	\N
cmbxvqezq00k0vd5hmv33d04p	264	Шевченко Екатерина Владимировна 	\N	\N	shipped	6250.00	RUB	2025-01-11 11:53:48	2025-01-11 11:53:48	2025-06-15 16:28:20.198	\N	0.00	Самарская обл, Большечерниговский р-н, село Большая Черниговка	500.00	2025-01-12 14:02:21	2025-01-13 14:02:21	\N
cmbxvqezs00k3vd5h0wkjxm37	263	Kalinina Elena Станиславовна 	\N	\N	cancelled	6000.00	RUB	2025-01-11 10:00:55	2025-01-11 10:00:55	2025-06-15 16:28:20.2	\N	0.00	г Москва	500.00	\N	\N	\N
cmbxvqezu00k6vd5h2rz5jmsk	262	Фокина Татьяна Олеговна	\N	\N	shipped	10200.00	RUB	2025-01-10 17:30:02	2025-01-10 17:30:02	2025-06-15 16:28:20.202	\N	0.00	Тульская обл, Новомосковский р-н, г Новомосковск	0.00	2025-01-10 15:41:43	2025-01-11 15:41:43	\N
cmbxvqezw00kbvd5h4onuo38x	261	Копылова Оксана Вячеславовна	\N	\N	shipped	10500.00	RUB	2025-01-10 17:03:14	2025-01-10 17:03:14	2025-06-15 16:28:20.204	\N	0.00	г Москва	0.00	2025-01-10 15:42:04	2025-01-11 15:42:04	\N
cmbxvqezz00kgvd5hzjzd1dhf	260	Костюков Дмитрий Александрович	\N	\N	shipped	5500.00	RUB	2025-01-10 14:55:02	2025-01-10 14:55:02	2025-06-15 16:28:20.206	\N	0.00	Московская обл, г Воскресенск, 	500.00	2025-01-10 15:42:21	2025-01-11 15:42:21	\N
cmbxvqf0100kjvd5h5ppxu371	259	Масягутов артур  Рустемович	\N	\N	shipped	6250.00	RUB	2025-01-10 14:42:01	2025-01-10 14:42:01	2025-06-15 16:28:20.208	\N	0.00	г Москва	500.00	2025-01-10 15:42:39	2025-01-11 15:42:39	\N
cmbxvqf0300kmvd5h7lrzp8ri	258	Камилатова Инга Сергеевна	\N	\N	shipped	5500.00	RUB	2025-01-10 14:26:17	2025-01-10 14:26:17	2025-06-15 16:28:20.211	\N	0.00	Вологодская обл, г Вологда	500.00	2025-01-10 15:43:02	2025-01-11 15:43:02	\N
cmbxvqf0400kpvd5h27ghk2rp	257	Малкова Марина Сергеевна	\N	\N	shipped	11000.00	RUB	2025-01-10 11:02:29	2025-01-10 11:02:29	2025-06-15 16:28:20.212	\N	0.00	Иркутская обл, г Усть-Илимск	0.00	2025-01-09 14:46:36	2025-01-10 14:46:36	\N
cmbxvqf0600ksvd5hd4eziq2e	256	Беломытцева Анна Ивановна	\N	\N	shipped	6250.00	RUB	2025-01-10 10:17:22	2025-01-10 10:17:22	2025-06-15 16:28:20.214	\N	0.00	Челябинская обл, г Миасс	500.00	2025-01-09 14:46:11	2025-01-10 14:46:11	\N
cmbxvqf0900kvvd5h9zif2wwe	255	Кукса Ирина Владимировна	\N	\N	shipped	5500.00	RUB	2025-01-10 07:42:36	2025-01-10 07:42:36	2025-06-15 16:28:20.217	\N	0.00	Нижегородская обл, г Нижний Новгород	500.00	2025-01-09 14:48:00	2025-01-10 14:48:00	\N
cmbxvqf0b00kyvd5hqiemkrxa	254	Ефремова Наталья Александровна 	\N	\N	overdue	6000.00	RUB	2025-01-10 06:52:45	2025-01-10 06:52:45	2025-06-15 16:28:20.219	\N	0.00	Кемеровская область - Кузбасс, г Новокузнецк, р-н Новоильинский	500.00	\N	\N	\N
cmbxvqf0d00l1vd5hnci3ojio	253	Ефремова Наталья Александровна 	\N	\N	shipped	6000.00	RUB	2025-01-10 04:54:18	2025-01-10 04:54:18	2025-06-15 16:28:20.22	\N	0.00	Кемеровская область - Кузбасс, г Новокузнецк, р-н Новоильинский	500.00	2025-01-09 14:49:05	2025-01-10 14:49:05	\N
cmbxvqf0e00l4vd5hgt6w9uhg	252	Петров Александр Александрович 	\N	\N	shipped	10000.00	RUB	2025-01-10 02:17:28	2025-01-10 02:17:28	2025-06-15 16:28:20.222	\N	0.00	Новосибирская обл, г Новосибирск	0.00	2025-01-09 14:48:24	2025-01-10 14:48:24	\N
cmbxvqf0g00l7vd5h8h27uxhj	251	Степанова Юлия Николаевна	\N	\N	shipped	5500.00	RUB	2025-01-09 21:12:00	2025-01-09 21:12:00	2025-06-15 16:28:20.223	\N	0.00	Респ Хакасия, Усть-Абаканский р-н, деревня Чапаево	500.00	2025-01-09 14:50:22	2025-01-10 14:50:22	\N
cmbxvqf0i00lavd5hfh5ellgd	250	Щипкина Анна Анатольевна	\N	\N	shipped	6000.00	RUB	2025-01-09 19:55:37	2025-01-09 19:55:37	2025-06-15 16:28:20.225	\N	0.00	Московская обл, г Дмитров, г Дмитров, поселок Горшково	500.00	2025-01-09 14:51:01	2025-01-10 14:51:01	\N
cmbxvqf0j00ldvd5hm695z5cj	249	Малахова Наталья Юрьевна	\N	\N	cancelled	6000.00	RUB	2025-01-09 17:33:45	2025-01-09 17:33:45	2025-06-15 16:28:20.227	\N	0.00	Московская обл, г Красногорск	500.00	\N	\N	\N
cmbxvqf0l00lgvd5ht608nas5	248	Александрова  Ирина  Михайловна 	\N	\N	shipped	11000.00	RUB	2025-01-09 15:31:22	2025-01-09 15:31:22	2025-06-15 16:28:20.229	\N	0.00	Псковская обл, Опочецкий р-н, г Опочка	0.00	2025-01-09 14:51:22	2025-01-10 14:51:22	\N
cmbxvqf0n00ljvd5howq2orzd	247	Самойлов Виктор  Викторович	\N	\N	shipped	11000.00	RUB	2025-01-09 13:43:26	2025-01-09 13:43:26	2025-06-15 16:28:20.231	\N	0.00	Воронежская обл, г Воронеж	0.00	2025-01-08 14:08:15	2025-01-09 14:08:15	\N
cmbxvqf0p00lmvd5h0dduckpb	246	Теряева Алёна Павловна	\N	\N	shipped	6400.00	RUB	2025-01-09 05:08:37	2025-01-09 05:08:37	2025-06-15 16:28:20.232	\N	0.00	Самарская обл, г Самара	500.00	2025-01-08 14:08:39	2025-01-09 14:08:39	\N
cmbxvqf0r00lpvd5he5jpxo2u	245	Латыпова  Ирэна  Анатольевна 	\N	\N	overdue	6250.00	RUB	2025-01-08 19:34:23	2025-01-08 19:34:23	2025-06-15 16:28:20.234	\N	0.00	Московская обл, г Одинцово, г Одинцово	500.00	\N	\N	\N
cmbxvqf0t00lsvd5hqkjekjvk	244	Артемьева  Ирина Николаевна	\N	\N	overdue	6000.00	RUB	2025-01-08 17:40:42	2025-01-08 17:40:42	2025-06-15 16:28:20.236	\N	0.00	Псковская обл, г Псков	500.00	\N	\N	\N
cmbxvqf0u00lvvd5hzq1s77x5	243	Аверина Наталья Александровна	\N	\N	overdue	6400.00	RUB	2025-01-08 14:56:16	2025-01-08 14:56:16	2025-06-15 16:28:20.238	\N	0.00	г Москва	500.00	\N	\N	\N
cmbxvqf0w00lyvd5ha61ocazo	242	Максимова Лариса Юрьевна	\N	\N	shipped	6250.00	RUB	2025-01-08 01:48:42	2025-01-08 01:48:42	2025-06-15 16:28:20.239	\N	0.00	Тульская обл, г Тула	500.00	2025-01-07 12:57:27	2025-01-08 12:57:27	\N
cmbxvqf0x00m1vd5haz4cyg9h	241	Хон Татьяна Игоревна	\N	\N	shipped	5400.00	RUB	2025-01-08 00:35:35	2025-01-08 00:35:35	2025-06-15 16:28:20.241	\N	0.00	г Москва	500.00	2025-01-07 12:57:46	2025-01-08 12:57:46	\N
cmbxvqf0z00m4vd5hqeh8zpq0	240	Дон Цаган Антоновна	\N	\N	shipped	11000.00	RUB	2025-01-07 21:44:30	2025-01-07 21:44:30	2025-06-15 16:28:20.243	\N	0.00	г Санкт-Петербург	0.00	2025-01-07 12:58:04	2025-01-08 12:58:04	\N
cmbxvqf1100m7vd5hg4oeblf1	239	Федорова  Алина  Владимировна 	\N	\N	shipped	19500.00	RUB	2025-01-07 17:24:42	2025-01-07 17:24:42	2025-06-15 16:28:20.244	\N	0.00	г Москва	0.00	2025-01-08 14:09:03	2025-01-09 14:09:03	\N
cmbxvqf1200mavd5ht99tecfm	238	Пашковская Альбина Миннигаяновна	\N	\N	shipped	10400.00	RUB	2025-01-07 16:25:07	2025-01-07 16:25:07	2025-06-15 16:28:20.246	\N	0.00	Ханты-Мансийский Автономный округ - Югра, г Нижневартовск	0.00	2025-01-07 12:58:27	2025-01-08 12:58:27	\N
cmbxvqf1400mdvd5hjm7rlbio	237	Пушкина Ксения Сергеевна	\N	\N	shipped	6000.00	RUB	2025-01-07 16:03:21	2025-01-07 16:03:21	2025-06-15 16:28:20.247	\N	0.00	Самарская обл, г Самара	500.00	2025-01-07 12:57:05	2025-01-08 12:57:05	\N
cmbxvqf1500mgvd5hkubfmedw	236	Михеева Дарья Вадимовна	\N	\N	shipped	11000.00	RUB	2025-01-07 12:40:11	2025-01-07 12:40:11	2025-06-15 16:28:20.249	\N	0.00	Респ Марий Эл, г Йошкар-Ола	0.00	2025-01-06 15:02:13	2025-01-07 15:02:13	\N
cmbxvqf1700mjvd5hve6hct89	235	Просвирина Ирина Анатольевна 	\N	\N	shipped	10000.00	RUB	2025-01-07 10:27:38	2025-01-07 10:27:38	2025-06-15 16:28:20.251	\N	0.00	Алтайский край, г Барнаул	0.00	2025-01-06 15:02:31	2025-01-07 15:02:31	\N
cmbxvqf1900mmvd5hbw44a97e	234	Иванов Данил Михайлович 	\N	\N	shipped	6250.00	RUB	2025-01-07 04:39:53	2025-01-07 04:39:53	2025-06-15 16:28:20.253	\N	0.00	г Санкт-Петербург	500.00	2025-01-09 14:16:21	2025-01-10 14:16:21	\N
cmbxvqf1b00mpvd5hdr01kgut	233	Степанова Юлия Николаевна	\N	\N	overdue	5500.00	RUB	2025-01-07 03:13:02	2025-01-07 03:13:02	2025-06-15 16:28:20.254	\N	0.00	Респ Хакасия, Усть-Абаканский р-н, деревня Чапаево	500.00	\N	\N	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public.products (id, name, description, price, stock_quantity, created_at, updated_at, deleted_at, ancestry, weight, dosage_form, package_quantity, main_ingredient, brand, old_price, is_visible, prime_cost, "avgPurchasePriceRub") FROM stdin;
4	Attex 100 mg		6500.00	55	2024-12-04 17:07:16.221	2025-06-15 16:28:37.973	\N	23/20			\N	Атомоксетин	ABDIIBRAHIM (Турция)	\N	t	\N	\N
7	Atominex 25 mg	Atominex 25 mg — препарат французского бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5500.00	92	2024-12-04 17:08:25.741	2025-06-15 16:28:37.974	\N	23/20	19 г		\N	Атомоксетин	Sanofi (Франция)	\N	t	\N	\N
21	Для похудения	Для похудения	\N	0	2025-01-25 11:53:37.547	2025-06-15 16:28:37.975	\N	23			\N			\N	t	\N	\N
31	Attex 40 mg		5000.00	47	2025-02-25 09:14:10.385	2025-06-15 16:28:37.976	\N	23/20			\N	Атомоксетин		\N	t	\N	\N
33	Abilify 5 mg	Abilify 5 мг — антипсихотическое средство нового поколения. Применяется для лечения шизофрении, биполярного расстройства и депрессии. Обладает мягким профилем побочных эффектов и регулирует уровень дофамина и серотонина в мозге. 	2900.00	0	2025-03-28 23:40:44.239	2025-06-15 16:28:37.977	\N	23/20		таблетки	28	Арипипразол	ABDIIBRAHIM (Турция)	\N	t	\N	\N
5	Доставка		500.00	0	2024-12-07 18:57:20.654	2025-06-15 16:28:37.978	2025-03-01 20:53:18.958	\N			\N			\N	t	\N	\N
35	Risperdal 1 Mg/ml сироп	Сироп Риспердал 1 мг/мл применяется для лечения СДВГ, агрессии, поведенческих нарушений и раздражительности у детей, включая аутизм. Подходит для тех, кто не может глотать таблетки. Быстрый эффект и удобная дозировка.\r\n	2800.00	57	2025-04-08 11:47:56.362	2025-06-15 16:28:37.98	\N	23/20	120	Сироп, 100 мл	\N	Рисперидон	Janssen-Cilag	\N	t	\N	\N
36	Другое		\N	0	2025-04-21 12:07:39.96	2025-06-15 16:28:37.991	\N	23			\N			\N	t	\N	\N
10	Atominex 40 mg	Atominex 40 mg — препарат французского бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5000.00	47	2024-12-09 15:13:57.46	2025-06-15 16:28:37.993	\N	23/20			\N			\N	t	\N	\N
15	Attex 10 mg	Atominex 10 mg — препарат турецкого бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5000.00	45	2024-12-11 15:05:09.221	2025-06-15 16:28:37.994	\N	23/20			\N	Атомоксетин	ABDIIBRAHIM (Турция)	\N	t	\N	\N
32	Attex 60 mg		5500.00	45	2025-02-26 09:56:38.977	2025-06-15 16:28:37.997	\N	23/20			\N		ABDIIBRAHIM (Турция)	\N	t	\N	\N
19	Attex 80 mg	Attex 80 mg — препарат турецкого бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5750.00	21	2025-01-10 15:53:49.344	2025-06-15 16:28:37.998	\N	23/20			\N	Атомоксетин	ABDIIBRAHIM (Турция)	\N	t	\N	\N
27	Arislow 2 mg		3600.00	13	2025-02-11 15:48:45.7	2025-06-15 16:28:38	\N	23/20			28	Гуанфацин		\N	t	\N	\N
9	Atominex 60 mg	Atominex 60 mg — препарат французского бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5500.00	41	2024-12-09 15:13:26.419	2025-06-15 16:28:38.001	\N	23/20		Капсулы	28	Атомоксетин	Sanofi (Франция)	\N	t	\N	\N
2	Atominex 10 mg	Atominex 10 mg — препарат французского бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5000.00	46	2024-11-29 06:51:07.883	2025-06-15 16:28:38.003	\N	23/20			\N	Атомоксетин	Sanofi (Франция)	\N	t	\N	\N
26	Arislow 1 mg		3200.00	11	2025-02-11 15:48:09.286	2025-06-15 16:28:38.005	\N	23/20			28	Гуанфацин		\N	t	\N	\N
29	Arislow 4 mg		3800.00	16	2025-02-11 15:49:43.722	2025-06-15 16:28:38.007	\N	23/20			28	Гуанфацин		\N	t	\N	\N
12	Atominex 80 mg	Atominex 80 mg — препарат французского бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5750.00	44	2024-12-09 15:14:40.872	2025-06-15 16:28:38.008	\N	23/20			\N	Атомоксетин	Sanofi (Франция)	\N	t	\N	\N
17	Atominex 100 mg	Atominex 100 mg — препарат французского бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	6000.00	48	2024-12-28 12:33:42.398	2025-06-15 16:28:38.01	\N	23/20			\N	Атомоксетин	Sanofi (Франция)	\N	t	\N	\N
18	Attex 18 mg	Attex 18 mg — препарат турецкого бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5500.00	43	2025-01-10 15:49:26.589	2025-06-15 16:28:38.011	\N	23/20			\N	Атомоксетин	ABDIIBRAHIM (Турция)	\N	t	\N	\N
38	Salazopyrin 500 mg	Противовоспалительное средство, применяемое при лечении воспалительных заболеваний кишечника и суставов, таких как язвенный колит, болезнь Крона и ревматоидный артрит.	2200.00	0	2025-04-23 12:19:21.683	2025-06-15 16:28:38.012	\N	23/36		таблетки	50	сульфасалазин	Pfizer	\N	t	\N	\N
23	Товары	\N	\N	0	2025-01-25 21:46:45.78	2025-06-15 16:28:37.967	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N
6	Strattera 4 mg ( 100 мл )		5900.00	0	2024-12-06 06:22:12.673	2025-06-15 16:28:37.97	2025-02-18 11:50:37.725	23/20			\N			\N	t	\N	\N
14	Strattera 10 mg		5000.00	0	2024-12-11 14:18:52.168	2025-06-15 16:28:37.971	2025-02-18 11:50:20.788	23/20			\N			\N	t	\N	\N
30	Attex 25 mg		5500.00	57	2025-02-25 09:12:53.437	2025-06-15 16:28:37.972	\N	23/20			\N	Атомоксетин	ABDIIBRAHIM (Турция)	\N	t	\N	\N
20	СДВГ	Препараты от СДВГ	\N	0	2025-01-19 20:53:30.197	2025-06-15 16:28:37.883	\N	23			\N			\N	t	\N	\N
34	Abilify 30 mg	Abilify (арипипразол) 30 мг — мощный атипичный антипсихотик, используемый при шизофрении и биполярном расстройстве у взрослых, а также в составе комбинированной терапии устойчивой депрессии.	6000.00	0	2025-03-28 23:47:48.474	2025-06-15 16:28:37.969	\N	23/20		таблетки	28	Арипипразол	ABDIIBRAHIM (Турция)	\N	t	\N	\N
37	Sustanon	Cмесь четырёх эфиров тестостерона, разработанный для гормонозаместительной терапии и длительного действия препарата после одной инъекции.\r\n\r\n🧬 Основные эффекты:\r\n\t•\tПовышение уровня тестостерона в крови\r\n\t•\tУвеличение мышечной массы\r\n\t•\tРост силы и выносливости\r\n\t•\tУскорение регенерации\r\n\t•\tПовышение либидо	3200.00	0	2025-04-21 12:15:12.977	2025-06-15 16:28:37.995	2025-04-21 12:37:31.039	23/36		Ампулы	\N			\N	t	\N	\N
28	Arislow 3 mg		3000.00	18	2025-02-11 15:49:04.65	2025-06-15 16:28:38.013	\N	23/20			28	Гуанфацин		3600.00	t	\N	\N
16	Siroksil		2100.00	0	2024-12-28 09:01:06.935	2025-06-15 16:28:38.016	2025-02-18 11:50:43.317	23/20			\N			\N	t	\N	\N
11	Atominex 18 mg	Atominex 18 mg — препарат французского бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	5200.00	98	2024-12-09 15:14:18.452	2025-06-15 16:28:38.019	\N	23/20			\N	Атомоксетин	Sanofi (Франция)	\N	t	\N	\N
13	Attex 4 mg (сироп)	Attex 4mg сироп — препарат турецкого бренда для лечения СДВГ. Обеспечивает улучшение концентрации и внимания. Удобная дозировка для взрослых и детей.	4900.00	44	2024-12-11 14:09:27.133	2025-06-15 16:28:38.021	\N	23/20			\N	Атомоксетин	ABDIIBRAHIM (Турция)	\N	t	\N	\N
24	Противозачаточные		\N	0	2025-02-11 15:32:23.322	2025-06-15 16:28:38.023	\N	23			\N			\N	t	\N	\N
39	Euthyrox 100 mcg	Euthyrox 100 мкг — препарат для заместительной терапии при гипотиреозе. Активный компонент — левотироксин натрия. Используется для компенсации дефицита гормонов щитовидной железы.\r\nПоказания: гипотиреоз, эутиреоидный зоб, терапия после удаления щитовидной железы.\r\nСпособ применения: по назначению врача.	650.00	0	2025-04-28 17:43:51.385	2025-06-15 16:28:38.031	\N	23/36	50г	Таблетки	\N	Левотироксин натрия	Merck KGaA	\N	t	\N	\N
25	Мирена 20 мкг/24 часа	20 мкг/24 часа\r\n	8900.00	26	2025-02-11 15:35:14.02	2025-06-15 16:28:38.039	\N	23/24		система внутриматочная терапевтическая	1	Левоноргестрел	Bayer OY (Финляндия)	11000.00	t	\N	\N
3	Abilify 15 mg	Abilify (арипипразол) 15 мг — антипсихотический препарат (атипичный нейролептик), применяемый для лечения шизофрении, биполярного расстройства, депрессии (в комбинации), а также при СДВГ и других психических нарушениях. Обладает уникальным механизмом действия — частичный агонист дофаминовых D2- и серотониновых 5-HT1A-рецепторов, а также антагонист 5-HT2A.	3600.00	0	2024-11-29 10:06:09.434	2025-06-15 16:28:38.043	\N	23/20		таблетки	28	Арипипразол	ABDIIBRAHIM (Турция)	\N	t	\N	\N
22	HHS A1 L-Carnitine Lepidium	Пороховое дерево: эффективно помогает при запорах, отвечает за секрецию желчи. Его используют для очистки кишечника от паразитов. Он помогает регулировать пищеварительную систему и систему кровообращения. L-карнитин: положительно влияет на энергию и спортивную эффективность, поскольку ускоряет сжигание жира. Кардамон: помогает устранить проблемы с пищеварительной системой. Он регулирует кислотность желудка, облегчает пищеварение и эффективен при выведении желудочно-кишечных газов. Имбирь: укрепляя иммунитет, он помогает сохранить здоровье при похудении. Трава галангала: используется для предотвращения образования газов в желудке и кишечнике. Фенхель: помогает выводить токсины из организма.\r\n\r\n • Расслабляет тело и оказывает профилактическое воздействие на газообразование. Фенхель эффективен для ускорения обмена веществ и очищения кожи. Корица: ускоряет кровообращение. Это помогает похудеть. Он помогает регулировать уровень сахара в крови: Гвоздика: очищает организм от микробов и помогает удалить вредные токсины из организма. Гвоздика является хорошим мочегонным средством.Укроп: облегчает пищеварение. Очищает почки и мочевыводящие пути. Он укрепляет печень. \r\n\r\n• Увеличивает выведение желчи. Гарциния камбоджийская: помогает контролировать аппетит благодаря содержащимся в ней стероидным гликозидам. \r\n\r\n• Он придает энергию телу и предотвращает такие состояния, как усталость, во время процесса снижения веса. Ускоряет обмен веществ, помогает сжигать жир и предотвращает образование нового жира. Он составляет основу жиросжигающих и насыщающих свойств смеси.	1800.00	55	2025-01-25 12:01:19.538	2025-06-15 16:28:38.022	\N	23/21	50	Капсулы	30	L-карнитин	HHS	\N	t	\N	\N
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public.purchase_items (id, quantity, "costPrice", total, "purchaseId", "createdAt", "updatedAt", "productName", "productId") FROM stdin;
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: eldar
--

COPY public.purchases (id, "createdAt", "updatedAt", "totalAmount", status, "isUrgent", expenses, "userId") FROM stdin;
\.


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: eldar
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: eldar
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: eldar
--

SELECT pg_catalog.setval('public.purchase_items_id_seq', 1, false);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: eldar
--

SELECT pg_catalog.setval('public.purchases_id_seq', 1, false);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: ApiKey ApiKey_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationToken VerificationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: ApiKey_name_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "ApiKey_name_key" ON public."ApiKey" USING btree (name);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_passwordResetToken_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "User_passwordResetToken_key" ON public."User" USING btree ("passwordResetToken");


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: exchange_rates_currency_effectiveDate_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "exchange_rates_currency_effectiveDate_key" ON public.exchange_rates USING btree (currency, "effectiveDate");


--
-- Name: exchange_rates_currency_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX exchange_rates_currency_idx ON public.exchange_rates USING btree (currency);


--
-- Name: exchange_rates_effectiveDate_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX "exchange_rates_effectiveDate_idx" ON public.exchange_rates USING btree ("effectiveDate");


--
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- Name: order_items_productId_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX "order_items_productId_idx" ON public.order_items USING btree ("productId");


--
-- Name: orders_externalId_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX "orders_externalId_idx" ON public.orders USING btree ("externalId");


--
-- Name: orders_externalId_key; Type: INDEX; Schema: public; Owner: eldar
--

CREATE UNIQUE INDEX "orders_externalId_key" ON public.orders USING btree ("externalId");


--
-- Name: orders_orderDate_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX "orders_orderDate_idx" ON public.orders USING btree ("orderDate");


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: products_ancestry_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX products_ancestry_idx ON public.products USING btree (ancestry);


--
-- Name: products_name_idx; Type: INDEX; Schema: public; Owner: eldar
--

CREATE INDEX products_name_idx ON public.products USING btree (name);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ApiKey ApiKey_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expenses expenses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_items purchase_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT "purchase_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_items purchase_items_purchaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES public.purchases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchases purchases_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eldar
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT "purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

