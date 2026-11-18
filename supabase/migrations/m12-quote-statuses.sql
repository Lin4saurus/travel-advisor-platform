-- Mundo Viajero — migración de M12 (panel administrativo): los 7 estados de una cotización.
--
-- Solo para una base que YA ejecutó `supabase/schema.sql` antes de M12 (la que solo admitía 'Nueva',
-- 'En revisión' y 'Enviada'). Una base nueva no la necesita: `schema.sql` ya trae los 7 estados.
--
-- Cómo ejecutarla: Supabase → tu proyecto → SQL Editor → New query → pegar este archivo COMPLETO → Run.
-- Es segura de repetir: vuelve a dejar la misma regla.
--
-- Flujo (TASK.md, M12): Nueva → En revisión → Contactado → Propuesta enviada → Confirmada → Cerrada → Cancelada.
-- El panel deja elegir cualquiera de los 7 (no obliga a seguir el orden): a veces hay que volver atrás o cancelar
-- desde cualquier punto.

begin;

-- 1. Quitar la regla vieja (Postgres le puso este nombre automáticamente al crear la tabla).
alter table travel_quotes drop constraint if exists travel_quotes_status_check;

-- 2. 'Enviada' (el nombre viejo) pasa a 'Propuesta enviada', que es lo que significaba.
update travel_quotes set status = 'Propuesta enviada' where status = 'Enviada';

-- 3. La regla nueva con los 7 estados.
alter table travel_quotes
  add constraint travel_quotes_status_check
  check (status in ('Nueva', 'En revisión', 'Contactado', 'Propuesta enviada', 'Confirmada', 'Cerrada', 'Cancelada'));

-- 4. El panel lista y filtra por estado y fecha: un índice para que no recorra toda la tabla.
create index if not exists travel_quotes_status_created_idx on travel_quotes(status, created_at desc);
create index if not exists travel_quotes_created_idx on travel_quotes(created_at desc);

commit;
