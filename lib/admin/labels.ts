// Traducción de los valores guardados en `travel_quotes` (slugs, códigos) a los textos que ve el panel admin.
import "server-only";
import { budgetProfiles, budgetTiers, contactMethods, requestTypes, serviceOptions } from "@/config/quote";
import { durationOptions } from "@/config/search";
import { categories } from "@/data/categories";
import type { CatalogKind } from "@/lib/catalog/normalize";
import type { QuoteRequestType } from "@/lib/supabase/types";

const find = (list: readonly { value: string; label: string }[], value: string | null) =>
  value ? (list.find((option) => option.value === value)?.label ?? value) : null;

export const requestTypeLabel = (value: QuoteRequestType) => find(requestTypes, value) ?? value;
export const durationLabel = (value: string | null) => find(durationOptions, value);
export const budgetTierLabel = (value: string | null) => find(budgetTiers, value);
export const contactMethodLabel = (value: string) => find(contactMethods, value) ?? value;
export const serviceLabels = (values: string[]) => values.map((value) => find(serviceOptions, value) ?? value);
export const preferenceLabels = (values: string[]) =>
  values.map((slug) => categories.find((category) => category.slug === slug)?.name ?? slug);
export const budgetProfileOf = (id: string | null) => budgetProfiles.find((profile) => profile.id === id) ?? null;

const kindOfRequest: Partial<Record<QuoteRequestType, CatalogKind>> = {
  paquete: "packages",
  experiencia: "experiences",
  evento: "events",
};

// Nombre actual del elemento del catálogo (con `names` de `catalogNames()`, lib/admin/catalog.ts); si ya no
// existe, se muestra el slug guardado.
export function catalogItemName(type: QuoteRequestType, slug: string | null, names: Map<string, string>): string | null {
  if (!slug) return null;
  const kind = kindOfRequest[type];
  return (kind && names.get(`${kind}:${slug}`)) || slug;
}
