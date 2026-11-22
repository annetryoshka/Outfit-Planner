-- PinWand: esquema para PostgreSQL local (docker) y RDS
-- Fuente: columnas, índices y constraints exportados de Supabase (schema public).
-- Requiere PostgreSQL 13 o más nuevo (gen_random_uuid() ya viene incluido).
--
-- Notas:
--  * Las llaves foráneas y los CHECK van dentro de cada CREATE TABLE, con los
--    mismos nombres y reglas ON DELETE que tiene Supabase.
--  * En Supabase no hay triggers, funciones ni enums en el schema public, así que
--    aquí no se crea ninguno. Cualquier lógica (por ejemplo likes_count) vive en el código.
--  * Las FK de likes, guardados, seguidores y wishlist NO tienen ON DELETE
--    (comportamiento NO ACTION), igual que en Supabase: no se puede borrar un
--    usuario o una prenda que todavía tenga filas en esas tablas.
--  * Este script solo corre la primera vez que se crea el volumen del contenedor.

-- ============================================================
-- TABLAS (en orden de dependencias)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      varchar NOT NULL,
  apellido    varchar,
  email       varchar NOT NULL,
  password    varchar NOT NULL,
  foto_perfil varchar,
  fondo       varchar,
  color_panel varchar DEFAULT '#ffffff',
  ciudad      varchar,
  bio         varchar,
  es_privado  boolean DEFAULT false,
  created_at  timestamp DEFAULT now(),
  CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS prendas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid,
  nombre      varchar NOT NULL,
  tipo        varchar,
  categoria   varchar NOT NULL,
  color       varchar,
  marca       varchar,
  temporada   varchar,
  material    varchar,
  talla       varchar,
  imagen_url  varchar,
  publico     boolean NOT NULL DEFAULT false,
  likes_count integer NOT NULL DEFAULT 0,
  created_at  timestamp DEFAULT now(),
  CONSTRAINT prendas_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outfits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid,
  nombre           varchar NOT NULL,
  ocasion          varchar,
  es_publico       boolean DEFAULT false,
  es_clon          boolean,
  imagen_url       varchar,
  fecha_calendario date,
  canvas_data      jsonb,
  created_at       timestamp DEFAULT now(),
  CONSTRAINT outfits_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outfit_prendas (
  outfit_id uuid NOT NULL,
  prenda_id uuid NOT NULL,
  CONSTRAINT outfit_prendas_pkey PRIMARY KEY (outfit_id, prenda_id),
  CONSTRAINT outfit_prendas_outfit_id_fkey
    FOREIGN KEY (outfit_id) REFERENCES outfits (id) ON DELETE CASCADE,
  CONSTRAINT outfit_prendas_prenda_id_fkey
    FOREIGN KEY (prenda_id) REFERENCES prendas (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tryon_history (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL,
  outfit_id             uuid,
  imagen_url            varchar NOT NULL,
  configuracion_prendas jsonb,
  created_at            timestamptz DEFAULT now(),
  CONSTRAINT tryon_history_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT tryon_history_outfit_id_fkey
    FOREIGN KEY (outfit_id) REFERENCES outfits (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS wishlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid,
  nombre     varchar NOT NULL,
  imagen_url varchar,
  precio     numeric,
  url_tienda varchar,
  created_at timestamp DEFAULT now(),
  CONSTRAINT wishlist_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  prenda_id  uuid NOT NULL,
  created_at timestamp DEFAULT now(),
  CONSTRAINT likes_unique UNIQUE (user_id, prenda_id),
  CONSTRAINT likes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT likes_prenda_id_fkey
    FOREIGN KEY (prenda_id) REFERENCES prendas (id)
);

CREATE TABLE IF NOT EXISTS guardados (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  prenda_id  uuid NOT NULL,
  created_at timestamp DEFAULT now(),
  CONSTRAINT guardados_unique UNIQUE (user_id, prenda_id),
  CONSTRAINT guardados_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT guardados_prenda_id_fkey
    FOREIGN KEY (prenda_id) REFERENCES prendas (id)
);

CREATE TABLE IF NOT EXISTS seguidores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  uuid NOT NULL,
  following_id uuid NOT NULL,
  estado       varchar NOT NULL DEFAULT 'aceptado',
  created_at   timestamp DEFAULT now(),
  CONSTRAINT seguidores_unique UNIQUE (follower_id, following_id),
  CONSTRAINT seguidores_follower_id_fkey
    FOREIGN KEY (follower_id) REFERENCES users (id),
  CONSTRAINT seguidores_following_id_fkey
    FOREIGN KEY (following_id) REFERENCES users (id),
  CONSTRAINT seguidores_estado_check
    CHECK (estado IN ('pendiente', 'aceptado')),
  CONSTRAINT seguidores_no_auto_seguimiento
    CHECK (follower_id <> following_id)
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  tipo       varchar NOT NULL,
  actor_id   uuid NOT NULL,
  prenda_id  uuid,
  leida      boolean NOT NULL DEFAULT false,
  created_at timestamp DEFAULT now(),
  CONSTRAINT notificaciones_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT notificaciones_actor_id_fkey
    FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT notificaciones_prenda_id_fkey
    FOREIGN KEY (prenda_id) REFERENCES prendas (id) ON DELETE CASCADE,
  CONSTRAINT notificaciones_tipo_check
    CHECK (tipo IN ('like', 'seguidor', 'solicitud_seguimiento', 'solicitud_aceptada')),
  CONSTRAINT notificaciones_no_autonotificacion
    CHECK (user_id <> actor_id)
);

-- ============================================================
-- ÍNDICES (los únicos y las llaves primarias ya salen de las constraints)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_prendas_usuario           ON prendas (user_id);
CREATE INDEX IF NOT EXISTS idx_prendas_tipo              ON prendas (tipo);
CREATE INDEX IF NOT EXISTS idx_prendas_temporada         ON prendas (temporada);
CREATE INDEX IF NOT EXISTS idx_prendas_usuario_tipo      ON prendas (user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_prendas_usuario_temporada ON prendas (user_id, temporada);

CREATE INDEX IF NOT EXISTS idx_outfits_usuario           ON outfits (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_usuario          ON wishlist (user_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_id    ON notificaciones (user_id, created_at DESC);