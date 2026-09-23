import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

// Cliente de servidor para Server Actions y route handlers: usa la clave anónima + las cookies de sesión de quien
// hace la solicitud, así que respeta las políticas RLS igual que el cliente de navegador (no eleva privilegios;
// para eso está `lib/supabase/admin.ts`, server-only). En Next.js 16 `cookies()` es asíncrono (ver
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md), por eso esta función también lo es.
//
// Hoy el sitio no tiene login de personas visitantes (llega con el panel admin en M12): mientras tanto este
// cliente actúa como anónimo y solo puede hacer lo que permite `supabase/schema.sql` (INSERT en las tablas de
// cotización, nada de SELECT).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `setAll` se llamó desde un Server Component (no se pueden escribir cookies ahí, ver la guía de
            // arriba). Se puede ignorar si algo más adelante (p. ej. `proxy.ts` en M12) refresca la sesión.
          }
        },
      },
    },
  );
}
