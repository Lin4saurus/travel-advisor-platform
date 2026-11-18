// "Me gusta" de paquetes y experiencias (tabla `catalog_likes`, supabase/migrations/m14-likes.sql). Server-only.
//
// - Un voto por navegador: identificador aleatorio en la cookie httpOnly `mv_visitor` (la crea la Server Action al
//   primer voto; leer el estado nunca crea cookies).
// - El contador es REAL: si la base no responde o la tabla no existe, `getLikeState` devuelve `null` y la página no
//   muestra el botón (regla del proyecto: nunca un número inventado).
// - Cliente service_role: la tabla no tiene políticas RLS públicas.
import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getCatalog } from "@/lib/catalog/read";
import { isSlug } from "@/lib/catalog/normalize";
import { createAdminClient } from "@/lib/supabase/admin";

export const LIKE_KINDS = ["packages", "experiences"] as const;
export type LikeKind = (typeof LIKE_KINDS)[number];
export type LikeState = { count: number; liked: boolean };

const VISITOR_COOKIE = "mv_visitor";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLikeKind(value: unknown): value is LikeKind {
  return typeof value === "string" && (LIKE_KINDS as readonly string[]).includes(value);
}

async function visitorId(): Promise<string | null> {
  const value = (await cookies()).get(VISITOR_COOKIE)?.value;
  return value && UUID.test(value) ? value : null;
}

async function readState(kind: LikeKind, slug: string, visitor: string | null): Promise<LikeState | null> {
  const admin = createAdminClient();
  const [countResult, mine] = await Promise.all([
    admin.from("catalog_likes").select("slug", { count: "exact", head: true }).eq("kind", kind).eq("slug", slug).retry(false),
    visitor
      ? admin
          .from("catalog_likes")
          .select("slug")
          .eq("kind", kind)
          .eq("slug", slug)
          .eq("visitor_id", visitor)
          .maybeSingle()
          .retry(false)
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (countResult.error || mine.error) {
    console.error("[likes] no se pudo leer:", countResult.error ?? mine.error);
    return null;
  }
  return { count: countResult.count ?? 0, liked: Boolean(mine.data) };
}

// Para la página de detalle. `null` = no mostrar el botón.
export async function getLikeState(kind: LikeKind, slug: string): Promise<LikeState | null> {
  // Si el catálogo vino del respaldo de data/, la base está caída: ni se intenta (evita esperar en cada visita).
  if ((await getCatalog()).source !== "database") return null;
  const visitor = await visitorId();
  try {
    return await readState(kind, slug, visitor);
  } catch (error) {
    console.error("[likes] error inesperado al leer:", error);
    return null;
  }
}

// Para la Server Action: valida todo, alterna el voto de este navegador y devuelve el estado nuevo.
export async function toggleLike(kind: unknown, slug: unknown, want: unknown): Promise<LikeState | null> {
  if (!isLikeKind(kind) || !isSlug(slug) || typeof want !== "boolean") return null;
  // Solo elementos publicados (nunca un slug inventado por quien hace el POST).
  const catalog = await getCatalog();
  if (catalog.source !== "database") return null;
  if (!catalog[kind].some((item) => item.slug === slug)) return null;

  const store = await cookies();
  let visitor = await visitorId();
  if (!visitor) {
    visitor = randomUUID();
    store.set(VISITOR_COOKIE, visitor, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  try {
    const admin = createAdminClient();
    // `want` = el estado que la persona quiere (no un "alternar" ciego): dos clics rápidos o un reintento no
    // invierten el resultado por error.
    const { error } = want
      ? await admin
          .from("catalog_likes")
          .upsert({ kind, slug, visitor_id: visitor }, { onConflict: "kind,slug,visitor_id", ignoreDuplicates: true })
      : await admin.from("catalog_likes").delete().eq("kind", kind).eq("slug", slug).eq("visitor_id", visitor);
    if (error) {
      console.error("[likes] no se pudo guardar:", error);
      return null;
    }
    return await readState(kind, slug, visitor);
  } catch (error) {
    console.error("[likes] error inesperado al guardar:", error);
    return null;
  }
}
