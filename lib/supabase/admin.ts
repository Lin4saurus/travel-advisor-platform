import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Cliente con la clave `service_role`: se salta las políticas RLS (ver `supabase/schema.sql`). El paquete
// `server-only` hace fallar el build si algún componente cliente llega a importar este archivo, aunque sea
// indirectamente. Nunca devolver el resultado de este cliente tal cual a una respuesta que lea un visitante
// anónimo: hay que decidir explícitamente qué columnas exponer.
//
// No lo pidió el prompt como tercer cliente, pero sin él la `service_role` key quedaría sin usar en ningún
// archivo: es la única forma de leer `travel_quotes`/`travel_quote_items` hasta que el panel admin (M12) tenga
// su propio esquema de autenticación con políticas RLS para personas administradoras.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
