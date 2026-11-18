// Catálogo en el panel admin (M12 fase 2): leer todo (también borradores y archivados) y escribir. Server-only.
//
// Igual que lib/admin/quotes.ts: cliente service_role (no hay política de escritura pública en `catalog_items`)
// y CADA función exportada vuelve a exigir un admin. Los errores de Supabase solo van al log; quien llama recibe
// `null` o un mensaje propio.
import "server-only";
import { getAdminUser } from "@/lib/admin/auth";
import { normalizers, type CatalogDataMap, type CatalogKind } from "@/lib/catalog/normalize";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogStatus } from "@/lib/supabase/types";

export const CATALOG_STATUS_LABELS: Record<CatalogStatus, string> = {
  draft: "No publicado",
  published: "Publicado",
  archived: "Archivado",
};

export function isCatalogStatus(value: unknown): value is CatalogStatus {
  return value === "draft" || value === "published" || value === "archived";
}

export type AdminCatalogItem<K extends CatalogKind = CatalogKind> = {
  id: string;
  kind: K;
  slug: string;
  status: CatalogStatus;
  sortOrder: number;
  updatedAt: string;
  data: CatalogDataMap[K];
};

export type WriteResult = { ok: true; slug: string } | { ok: false; message: string; field?: string };

const SAVE_ERROR = "No se pudo guardar. Revisa la conexión con la base de datos e inténtalo de nuevo.";

type Row = { id: string; kind: string; slug: string; status: CatalogStatus; sort_order: number; updated_at: string; data: unknown };

function toItem<K extends CatalogKind>(kind: K, row: Row): AdminCatalogItem<K> | null {
  const data = normalizers[kind]({ ...(row.data as object), slug: row.slug }) as CatalogDataMap[K] | null;
  if (!data) return null;
  return { id: row.id, kind, slug: row.slug, status: row.status, sortOrder: row.sort_order, updatedAt: row.updated_at, data };
}

export async function listCatalogItems<K extends CatalogKind>(
  kind: K,
  view: "active" | "archived",
): Promise<AdminCatalogItem<K>[] | null> {
  if (!(await getAdminUser())) return null;
  try {
    let query = createAdminClient()
      .from("catalog_items")
      .select("id, kind, slug, status, sort_order, updated_at, data")
      .eq("kind", kind)
      .order("sort_order")
      .order("slug");
    query = view === "archived" ? query.eq("status", "archived") : query.neq("status", "archived");
    const { data, error } = await query;
    if (error) {
      console.error("[admin-catalog] no se pudo listar:", error);
      return null;
    }
    return (data ?? []).map((row) => toItem(kind, row)).filter((item): item is AdminCatalogItem<K> => item !== null);
  } catch (error) {
    console.error("[admin-catalog] error inesperado al listar:", error);
    return null;
  }
}

export async function getCatalogItem<K extends CatalogKind>(kind: K, slug: string): Promise<AdminCatalogItem<K> | null> {
  if (!(await getAdminUser())) return null;
  try {
    const { data, error } = await createAdminClient()
      .from("catalog_items")
      .select("id, kind, slug, status, sort_order, updated_at, data")
      .eq("kind", kind)
      .eq("slug", slug)
      .maybeSingle();
    if (error) console.error("[admin-catalog] no se pudo leer:", error);
    return data ? toItem(kind, data) : null;
  } catch (error) {
    console.error("[admin-catalog] error inesperado al leer:", error);
    return null;
  }
}

// Conteo por tipo y estado para el resumen del panel.
export async function countCatalog(): Promise<Record<CatalogKind, Record<CatalogStatus, number>> | null> {
  if (!(await getAdminUser())) return null;
  try {
    const { data, error } = await createAdminClient().from("catalog_items").select("kind, status");
    if (error) {
      console.error("[admin-catalog] no se pudo contar:", error);
      return null;
    }
    const empty = () => ({ draft: 0, published: 0, archived: 0 });
    const counts = { packages: empty(), destinations: empty(), experiences: empty(), events: empty() };
    for (const row of data ?? []) {
      const bucket = counts[row.kind as CatalogKind];
      if (bucket && isCatalogStatus(row.status)) bucket[row.status] += 1;
    }
    return counts;
  } catch (error) {
    console.error("[admin-catalog] error inesperado al contar:", error);
    return null;
  }
}

// Nombres de todo el catálogo (incluidos borradores y archivados) para mostrar las cotizaciones.
export async function catalogNames(): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  if (!(await getAdminUser())) return names;
  try {
    const { data, error } = await createAdminClient().from("catalog_items").select("kind, slug, data");
    if (error) console.error("[admin-catalog] no se pudieron leer los nombres:", error);
    for (const row of data ?? []) {
      const name = (row.data as { name?: unknown })?.name;
      if (typeof name === "string") names.set(`${row.kind}:${row.slug}`, name);
    }
  } catch (error) {
    console.error("[admin-catalog] error inesperado al leer los nombres:", error);
  }
  return names;
}

export async function createCatalogItem<K extends CatalogKind>(
  kind: K,
  data: CatalogDataMap[K],
  sortOrder: number,
  status: CatalogStatus,
): Promise<WriteResult> {
  if (!(await getAdminUser())) return { ok: false, message: "Tu sesión terminó. Vuelve a ingresar." };
  try {
    const { error } = await createAdminClient()
      .from("catalog_items")
      .insert({ kind, slug: data.slug, status, sort_order: sortOrder, data: data as unknown as Record<string, unknown> });
    if (error) {
      if (error.code === "23505") {
        return { ok: false, field: "slug", message: `Ya existe un elemento con el identificador «${data.slug}».` };
      }
      console.error("[admin-catalog] no se pudo crear:", error);
      return { ok: false, message: SAVE_ERROR };
    }
    return { ok: true, slug: data.slug };
  } catch (error) {
    console.error("[admin-catalog] error inesperado al crear:", error);
    return { ok: false, message: SAVE_ERROR };
  }
}

export async function updateCatalogItem<K extends CatalogKind>(
  kind: K,
  slug: string,
  data: CatalogDataMap[K],
  sortOrder: number,
): Promise<WriteResult> {
  if (!(await getAdminUser())) return { ok: false, message: "Tu sesión terminó. Vuelve a ingresar." };
  try {
    const { data: updated, error } = await createAdminClient()
      .from("catalog_items")
      .update({ sort_order: sortOrder, data: { ...data, slug } as unknown as Record<string, unknown> })
      .eq("kind", kind)
      .eq("slug", slug)
      .select("id")
      .maybeSingle();
    if (error || !updated) {
      console.error("[admin-catalog] no se pudo actualizar:", error ?? "elemento inexistente");
      return { ok: false, message: SAVE_ERROR };
    }
    return { ok: true, slug };
  } catch (error) {
    console.error("[admin-catalog] error inesperado al actualizar:", error);
    return { ok: false, message: SAVE_ERROR };
  }
}

export async function setCatalogStatus(kind: CatalogKind, slug: string, status: CatalogStatus): Promise<boolean> {
  if (!(await getAdminUser())) return false;
  try {
    const { data, error } = await createAdminClient()
      .from("catalog_items")
      .update({ status })
      .eq("kind", kind)
      .eq("slug", slug)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      console.error("[admin-catalog] no se pudo cambiar el estado:", error ?? "elemento inexistente");
      return false;
    }
    return true;
  } catch (error) {
    console.error("[admin-catalog] error inesperado al cambiar el estado:", error);
    return false;
  }
}

// Copia como "no publicado" con el identificador libre siguiente: `<slug>-copia`, `<slug>-copia-2`, …
export async function duplicateCatalogItem(kind: CatalogKind, slug: string): Promise<WriteResult> {
  const original = await getCatalogItem(kind, slug);
  if (!original) return { ok: false, message: "No se encontró el elemento a duplicar." };
  try {
    const { data: taken } = await createAdminClient()
      .from("catalog_items")
      .select("slug")
      .eq("kind", kind)
      .like("slug", `${slug.slice(0, 48)}-copia%`);
    const used = new Set((taken ?? []).map((row) => row.slug));
    const stem = `${slug.slice(0, 48)}-copia`;
    let candidate = stem;
    for (let n = 2; used.has(candidate) && n < 100; n += 1) candidate = `${stem}-${n}`;
    const copy = { ...original.data, slug: candidate, name: `${original.data.name} (copia)`.slice(0, 100) };
    return createCatalogItem(kind, copy as CatalogDataMap[typeof kind], original.sortOrder + 1, "draft");
  } catch (error) {
    console.error("[admin-catalog] error inesperado al duplicar:", error);
    return { ok: false, message: SAVE_ERROR };
  }
}
