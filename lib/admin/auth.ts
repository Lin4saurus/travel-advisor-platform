// Autorización del panel admin (M12). Server-only.
//
// Quién es admin: una persona con sesión de Supabase Auth (correo + contraseña) cuyo correo figura en la variable
// de entorno `ADMIN_EMAILS` (lista separada por comas, en `.env.local`). Si la variable falta o está vacía, NADIE
// es admin (falla cerrado). Las cuentas se crean en Supabase → Authentication → Users → Add user.
//
// `proxy.ts` hace solo una comprobación optimista (¿hay sesión?) para redirigir rápido al login. La comprobación
// real es esta: la guía de Next 16 pide verificar la autorización cerca de los datos, en cada página y en cada
// Server Action (una Server Action es alcanzable con un POST directo aunque el proxy no la cubra), ver
// node_modules/next/dist/docs/01-app/02-guides/authentication.md y data-security.md.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// ¿Está el panel configurado en este servidor? (variables de Supabase + al menos un correo admin). Solo para
// mostrar un aviso en el login; no revela qué falta (eso va al log).
export function adminConfigured(): boolean {
  return Boolean(supabasePublicEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY && adminEmails().length > 0);
}

export type AdminUser = { id: string; email: string };

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

// `getUser()` (no `getSession()`) valida el token contra Supabase en cada llamada: `getSession()` solo lee la
// cookie y se podría falsificar. `cache` evita repetir esa consulta si el layout y la página la piden en el mismo
// render.
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  // Fuera del try a propósito: `cookies()` lanza una señal interna de Next para marcar la página como dinámica
  // durante el build; atraparla la convertiría en un falso error. Se llama antes de mirar las variables para que la
  // página siga siendo dinámica aunque falten.
  await cookies();
  if (!supabasePublicEnv()) return null;
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email || !isAdminEmail(data.user.email)) return null;
    return { id: data.user.id, email: data.user.email };
  } catch (error) {
    console.error("[admin-auth] no se pudo comprobar la sesión:", error);
    return null;
  }
});

// Para páginas del panel: sin admin válido, al login (con la ruta de vuelta).
export async function requireAdmin(returnTo = "/admin"): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(safeAdminPath(returnTo))}`);
  return user;
}

// Solo se permite volver a una ruta del propio panel (nada de `//otro-sitio` ni URLs absolutas: open redirect).
export function safeAdminPath(value: unknown): string {
  if (typeof value !== "string") return "/admin";
  if (!value.startsWith("/admin") || value.startsWith("//") || value.includes("\\")) return "/admin";
  if (value.startsWith("/admin/login")) return "/admin";
  return value.slice(0, 200);
}
