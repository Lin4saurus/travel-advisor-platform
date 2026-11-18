// Lectura del catálogo PUBLICADO para el sitio público (M12 fase 2). Server-only.
//
// - Fuente: tabla `catalog_items` de Supabase (solo `status = 'published'`), con la clave anónima y sin cookies:
//   la política RLS de lectura pública ya limita a lo publicado, y al no depender de la persona que visita, el
//   resultado se puede cachear para todas.
// - Caché: `unstable_cache` con la etiqueta `CATALOG_TAG` (5 min como red de seguridad). El panel la invalida al
//   guardar (`updateTag`, lib/admin/catalog.ts), así un cambio se ve en la siguiente carga.
// - Respaldo: si Supabase falla (caído, tabla todavía no creada, claves vacías), el sitio usa el catálogo de
//   demostración de `data/*.ts` y lo registra en el log. El respaldo NO se cachea: en cuanto la base vuelve, se usa.
//   Ojo: durante una caída podría reaparecer algo que se despublicó en el panel (es lo que hay en `data/`).
import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { destinations as seedDestinations, type Destination } from "@/data/destinations";
import { events as seedEvents, type TravelEvent } from "@/data/events";
import { experiences as seedExperiences, type Experience } from "@/data/experiences";
import { packages as seedPackages, type TravelPackage } from "@/data/packages";
import { CATALOG_KINDS, normalizers, type CatalogKind } from "@/lib/catalog/normalize";
import type { Database } from "@/lib/supabase/types";

export const CATALOG_TAG = "catalog";

const FETCH_TIMEOUT_MS = 3000;
const COOLDOWN_MS = 30_000;

export type Catalog = {
  packages: TravelPackage[];
  destinations: Destination[];
  experiences: Experience[];
  events: TravelEvent[];
  source: "database" | "seed";
};

const seedCatalog = (): Catalog => ({
  packages: seedPackages,
  destinations: seedDestinations,
  experiences: seedExperiences,
  events: seedEvents,
  source: "seed",
});

async function fetchPublished(): Promise<Catalog> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Tope de espera por consulta: el sitio público no puede quedarse colgado esperando a la base.
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }) },
  });
  const { data, error } = await supabase
    .from("catalog_items")
    .select("kind, slug, data, sort_order")
    .eq("status", "published")
    .order("sort_order")
    .order("slug")
    // postgrest-js reintenta los GET 3 veces con espera creciente (1 s, 2 s, 4 s): medido, ~7 s por página con
    // la base caída. Sin reintentos se pasa enseguida al respaldo.
    .retry(false);
  if (error) throw new Error(`catalog_items: ${error.code ?? ""} ${error.message}`);

  const catalog: Catalog = { packages: [], destinations: [], experiences: [], events: [], source: "database" };
  for (const row of data ?? []) {
    const kind = row.kind as CatalogKind;
    if (!CATALOG_KINDS.includes(kind)) continue;
    // El slug de la columna manda sobre el que haya dentro del JSON (es el que tiene la restricción única).
    const item = normalizers[kind]({ ...row.data, slug: row.slug });
    if (item) (catalog[kind] as unknown[]).push(item);
  }
  return catalog;
}

const cachedPublished = unstable_cache(fetchPublished, ["catalog-published-v1"], {
  tags: [CATALOG_TAG],
  revalidate: 300,
});

// Tras un fallo, durante `COOLDOWN_MS` se va directo al respaldo sin volver a intentar: con la base caída cada
// visita no paga la espera, y el log no se llena con un error por página. Vive en la memoria del proceso.
let failedAt = 0;

// `cache` de React: dentro de un mismo render (página + metadata + componentes) se consulta una sola vez.
export const getCatalog = cache(async (): Promise<Catalog> => {
  if (Date.now() - failedAt < COOLDOWN_MS) return seedCatalog();
  try {
    return await cachedPublished();
  } catch (error) {
    failedAt = Date.now();
    console.error(
      `[catalog] Supabase no respondió; se usa el catálogo de data/*.ts (próximo intento en ${COOLDOWN_MS / 1000} s):`,
      error instanceof Error ? error.message : error,
    );
    return seedCatalog();
  }
});
