// Variables públicas de Supabase (URL + clave anónima). Sin ellas, `@supabase/ssr` lanza una excepción al crear el
// cliente: en Vercel eso se veía como un 500 en todo /admin cuando faltaban en el entorno. Quien las use comprueba
// primero con esta función y, si faltan, sigue sin sesión y lo deja en el log.
let warned = false;

export function supabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) return { url, anonKey };
  if (!warned) {
    warned = true;
    console.error(
      "[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno (en Vercel: Settings → Environment Variables, entorno Production, y volver a desplegar).",
    );
  }
  return null;
}
