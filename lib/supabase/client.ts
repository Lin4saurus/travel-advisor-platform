"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

// Cliente de navegador: usa la clave anónima (segura de exponer al público; lo que puede hacer lo decide RLS en
// Supabase, ver `supabase/schema.sql`, no el secreto de la clave). Se crea una instancia por llamada, como
// recomienda `@supabase/ssr` para el App Router, en vez de un singleton a nivel de módulo.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
