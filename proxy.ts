// Proxy de Next 16 (antes "middleware"). Solo corre en `/admin/*` (ver `config.matcher`).
//
// Hace dos cosas:
// 1. Refresca la sesión de Supabase Auth y reescribe sus cookies (los Server Components no pueden escribir
//    cookies, ver el comentario de `setAll` en lib/supabase/server.ts). Patrón de `@supabase/ssr`.
// 2. Comprobación OPTIMISTA: sin sesión, redirige a `/admin/login`. No decide quién es admin (eso lo hace
//    `requireAdmin` en cada página y Server Action, lib/admin/auth.ts): la guía de Next advierte que el proxy no
//    debe ser la única barrera.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
        },
      },
    },
  );

  let hasUser = false;
  try {
    const { data } = await supabase.auth.getUser();
    hasUser = Boolean(data.user);
  } catch (error) {
    // Supabase caído o inalcanzable: se trata como "sin sesión" (falla cerrado).
    console.error("[proxy] no se pudo comprobar la sesión:", error);
  }

  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!hasUser && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    // Conservar las cookies que Supabase haya limpiado/actualizado (p. ej. un token vencido).
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  // Ninguna página del panel se cachea en el navegador ni en un proxy intermedio.
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
