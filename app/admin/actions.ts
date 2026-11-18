"use server";

// Server Actions del panel admin (M12). Cada una comprueba por su cuenta lo que necesita: una Server Action es un
// POST alcanzable directamente, sin pasar por la página que la muestra (ver lib/admin/auth.ts).
import { redirect } from "next/navigation";
import { isAdminEmail, requireAdmin, safeAdminPath } from "@/lib/admin/auth";
import { updateQuoteStatus } from "@/lib/admin/quotes";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null; email: string };

// Un solo mensaje para "correo/contraseña incorrectos" y "la cuenta existe pero no es admin": no se revela cuál
// de las dos cosas falló.
const INVALID_LOGIN = "Correo o contraseña incorrectos, o la cuenta no tiene acceso al panel.";
const LOGIN_UNAVAILABLE = "No pudimos conectar con el servicio de acceso. Inténtalo de nuevo en unos minutos.";

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");
  const email = typeof emailRaw === "string" ? emailRaw.trim().slice(0, 254) : "";
  const password = typeof passwordRaw === "string" ? passwordRaw.slice(0, 200) : "";
  const next = safeAdminPath(formData.get("next"));

  if (!email || !password) return { error: "Escribe tu correo y tu contraseña.", email };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Escribe un correo válido.", email };

  // Si el correo ni siquiera está en la lista, no hace falta preguntarle a Supabase.
  if (!isAdminEmail(email)) return { error: INVALID_LOGIN, email };

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // 400 = credenciales inválidas; cualquier otra cosa (red, Supabase caído) es "servicio no disponible".
      const status = "status" in error ? error.status : undefined;
      if (status === 400 || status === 401 || status === 422) return { error: INVALID_LOGIN, email };
      console.error("[admin-login] fallo de Supabase Auth:", error);
      return { error: LOGIN_UNAVAILABLE, email };
    }
    if (!isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      return { error: INVALID_LOGIN, email };
    }
  } catch (error) {
    console.error("[admin-login] error inesperado:", error);
    return { error: LOGIN_UNAVAILABLE, email };
  }

  // `redirect` lanza una excepción especial de Next: debe ir fuera del try/catch.
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[admin-logout] error al cerrar sesión:", error);
  }
  redirect("/admin/login");
}

export async function changeQuoteStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const status = formData.get("status");
  const back = typeof id === "string" ? `/admin/quotes/${encodeURIComponent(id)}` : "/admin/quotes";
  await requireAdmin(back);

  const ok = await updateQuoteStatus(id, status);
  redirect(`${back}?${ok ? "saved=1" : "error=1"}`);
}
