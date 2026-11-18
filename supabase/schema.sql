-- Universal Tours — esquema de Supabase para las cotizaciones.
-- Prerequisito de M10 (TASK.md): deja la base de datos lista para cuando M10 conecte el envío real de /quote.
-- Este paso NO conecta el formulario todavía (sigue como en M9: no guarda ni envía nada).
--
-- Cómo ejecutarlo: Supabase → tu proyecto → SQL Editor → New query → pegar este archivo COMPLETO → Run.
-- Se ejecuta una sola vez. Usa "if not exists" / "or replace" donde es razonable, pero volver a correrlo sobre
-- una base con cotizaciones reales reiniciaría la secuencia de referencias (sección 2): no ejecutar dos veces en
-- producción sin revisar antes.

-- ============================================================================
-- 1. Extensión para generar uuid (gen_random_uuid). Supabase casi siempre la trae activada; esto es por si acaso.
-- ============================================================================
create extension if not exists pgcrypto;

-- ============================================================================
-- 2. Número de solicitud legible para la persona (p. ej. "TV-2026-0001"): una secuencia + una función que la usa
--    como valor por defecto de `travel_quotes.reference`. Es lo que M10 mostrará en `QuoteSuccess`.
-- ============================================================================
create sequence if not exists travel_quote_reference_seq;

create or replace function travel_quote_next_reference()
returns text
language sql
as $$
  select 'TV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('travel_quote_reference_seq')::text, 4, '0');
$$;

-- ============================================================================
-- 3. Tabla principal: una fila por solicitud de cotización (el paso 8 de /quote, ver lib/quote.ts QuoteState y
--    lib/supabase/types.ts TravelQuote). Los nombres de columna van en snake_case (convención SQL); la
--    conversión a/desde el camelCase de la app queda para el código de M10.
-- ============================================================================
create table if not exists travel_quotes (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default travel_quote_next_reference(),

  request_type text not null check (request_type in ('a-medida', 'paquete', 'experiencia', 'evento')),
  -- Slug del paquete/experiencia/evento elegido en el paso "Destino" (null = viaje a medida o sin elegir).
  item_slug text,

  destination text,
  needs_suggestions boolean not null default false,

  departure_date date,
  return_date date,
  flexible_dates boolean not null default false,
  -- Rango de `config/search.ts` (durationOptions), p. ej. "4-7".
  duration text,

  -- Mismos límites que `config/quote.ts` (quoteLimits): 1-50 adultos, 0-20 niños.
  adults integer not null check (adults between 1 and 50),
  children integer not null default 0 check (children between 0 and 20),
  -- Edades de cada niño (0 a 17), en el mismo orden que se mostraron en el formulario.
  children_ages jsonb not null default '[]'::jsonb,

  -- Slugs de `data/categories.ts` elegidos en "Preferencias" (tipo de viaje).
  preferences text[] not null default '{}',
  -- "flights" | "transfers" | "excursions" (`config/quote.ts`, serviceOptions).
  services text[] not null default '{}',
  notes text,

  -- Id de `config/quote.ts` (budgetProfiles), p. ej. "bolivia" | "internacional".
  budget_profile text,
  -- Rango de `config/search.ts` (budgetOptions): es el "budgetLevel" del pedido original.
  budget_tier text,
  budget_amount numeric check (budget_amount is null or budget_amount > 0),

  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  contact_method text not null,
  accept_privacy boolean not null default false,

  -- Flujo del panel admin (M12). Toda cotización nace 'Nueva'. Una base creada antes de M12 (con solo 'Nueva',
  -- 'En revisión' y 'Enviada') se actualiza con `supabase/migrations/m12-quote-statuses.sql`.
  status text not null default 'Nueva'
    check (status in ('Nueva', 'En revisión', 'Contactado', 'Propuesta enviada', 'Confirmada', 'Cerrada', 'Cancelada')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table travel_quotes is 'Una fila por solicitud de cotización enviada desde /quote (M9/M10). Ver lib/supabase/types.ts.';

-- `updated_at` se actualiza sola en cada UPDATE (el código de la app no tiene que acordarse de tocarla).
create or replace function travel_quotes_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists travel_quotes_set_updated_at on travel_quotes;
create trigger travel_quotes_set_updated_at
  before update on travel_quotes
  for each row
  execute function travel_quotes_set_updated_at();

-- ============================================================================
-- 4. Elementos del catálogo asociados a una cotización (relación con travel_quotes por quote_id).
--    Hoy el formulario de M9 permite elegir un solo elemento (travel_quotes.item_slug); esta tabla queda lista
--    para cuando una cotización pueda pedir varios (p. ej. un paquete + una experiencia adicional).
-- ============================================================================
create table if not exists travel_quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references travel_quotes(id) on delete cascade,
  item_type text not null check (item_type in ('paquete', 'experiencia', 'evento')),
  item_slug text not null,
  -- Copia del nombre en el momento de la solicitud: el catálogo vive en código (`data/`), no en la base de
  -- datos, y podría cambiar o dejar de existir después de creada la cotización.
  item_name text not null,
  created_at timestamptz not null default now()
);

comment on table travel_quote_items is 'Elementos del catálogo (paquete/experiencia/evento) pedidos en una cotización. Ver lib/supabase/types.ts.';

create index if not exists travel_quote_items_quote_id_idx on travel_quote_items(quote_id);

-- El panel admin (M12) lista y filtra por estado y fecha.
create index if not exists travel_quotes_status_created_idx on travel_quotes(status, created_at desc);
create index if not exists travel_quotes_created_idx on travel_quotes(created_at desc);

-- ============================================================================
-- 5. RLS: cualquier visitante puede CREAR una cotización; nadie puede LEER, EDITAR ni BORRAR de forma pública.
--    Con RLS activado y sin una política que lo permita, Postgres deniega esa operación por defecto: no hacer
--    falta una política explícita de "denegar". La lectura queda para el panel admin (M12).
-- ============================================================================
alter table travel_quotes enable row level security;
alter table travel_quote_items enable row level security;

drop policy if exists "Cualquiera puede crear una cotización" on travel_quotes;
create policy "Cualquiera puede crear una cotización"
  on travel_quotes
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Cualquiera puede agregar elementos a una cotización" on travel_quote_items;
create policy "Cualquiera puede agregar elementos a una cotización"
  on travel_quote_items
  for insert
  to anon, authenticated
  with check (true);

-- ============================================================================
-- Nota para M10 (no es parte de este esquema, es un aviso): en PostgreSQL, `INSERT ... RETURNING` obedece las
-- políticas de SELECT, no las de INSERT. Como a propósito NO hay política de SELECT pública, un insert hecho con
-- la clave anónima (`lib/supabase/client.ts` o `lib/supabase/server.ts`) insertará la fila pero el cliente de
-- Supabase no podrá leer de vuelta el `reference` generado (la respuesta de `.select()` vendrá vacía). Para
-- mostrar el número de solicitud en `QuoteSuccess`, M10 debería insertar (y leer el resultado) desde una Server
-- Action usando `lib/supabase/admin.ts` (server-only, se salta RLS), nunca desde el navegador.
-- ============================================================================
