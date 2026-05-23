-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.outfit_prendas (
  outfit_id uuid NOT NULL,
  prenda_id uuid NOT NULL,
  CONSTRAINT outfit_prendas_pkey PRIMARY KEY (outfit_id, prenda_id),
  CONSTRAINT outfit_prendas_outfit_id_fkey FOREIGN KEY (outfit_id) REFERENCES public.outfits(id),
  CONSTRAINT outfit_prendas_prenda_id_fkey FOREIGN KEY (prenda_id) REFERENCES public.prendas(id)
);
CREATE TABLE public.outfits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nombre character varying NOT NULL,
  ocasion character varying,
  es_publico boolean DEFAULT false,
  imagen_url character varying,
  fecha_calendario date,
  created_at timestamp without time zone DEFAULT now(),
  canvas_data jsonb,
  es_clon boolean,
  CONSTRAINT outfits_pkey PRIMARY KEY (id),
  CONSTRAINT outfits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.prendas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nombre character varying NOT NULL,
  tipo character varying,
  color character varying,
  marca character varying,
  temporada character varying,
  material character varying,
  imagen_url character varying,
  created_at timestamp without time zone DEFAULT now(),
  talla character varying,
  categoria character varying NOT NULL,
  publico boolean NOT NULL DEFAULT false,
  CONSTRAINT prendas_pkey PRIMARY KEY (id),
  CONSTRAINT prendas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tryon_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  outfit_id uuid,
  imagen_url character varying NOT NULL,
  configuracion_prendas jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tryon_history_pkey PRIMARY KEY (id),
  CONSTRAINT tryon_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT tryon_history_outfit_id_fkey FOREIGN KEY (outfit_id) REFERENCES public.outfits(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  foto_perfil character varying,
  created_at timestamp without time zone DEFAULT now(),
  ciudad character varying,
  bio character varying,
  es_privado boolean DEFAULT false,
  apellido character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wishlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nombre character varying NOT NULL,
  imagen_url character varying,
  precio numeric,
  url_tienda character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT wishlist_pkey PRIMARY KEY (id),
  CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);