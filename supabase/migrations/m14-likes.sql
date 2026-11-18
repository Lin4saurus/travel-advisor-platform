-- Universal Tours — "Me gusta" en paquetes y experiencias (botón con contador del detalle).
--
-- Un voto por navegador y por elemento: `visitor_id` es un identificador aleatorio que el servidor guarda en una
-- cookie (`mv_visitor`, httpOnly). No es un dato personal: no se asocia a nombre, correo ni IP.
-- Limitación conocida: quien borre sus cookies puede volver a votar; el contador es orientativo, no una métrica
-- de seguridad.
--
-- Cómo ejecutarla: Supabase → SQL Editor → New query → pegar este archivo COMPLETO → Run. Segura de repetir.

create table if not exists catalog_likes (
  kind text not null check (kind in ('packages', 'experiences')),
  slug text not null check (char_length(slug) <= 60 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (kind, slug, visitor_id)
);

comment on table catalog_likes is 'Un "Me gusta" por navegador (cookie mv_visitor) y por paquete/experiencia. Ver lib/likes.ts.';

-- RLS sin políticas: con la clave anónima no se puede leer ni escribir nada. El sitio cuenta y vota desde el
-- servidor (Server Action) con la clave service_role, después de validar el elemento.
alter table catalog_likes enable row level security;
