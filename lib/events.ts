// Lógica pura del catálogo de eventos: lectura de la URL (?category=), filtro y conteos.
import { eventCategories, type TravelEvent } from "@/data/events";

export type RawSearchParams = Record<string, string | string[] | undefined>;

// La categoría de la URL solo cuenta si existe en `eventCategories`; cualquier otra cosa se ignora.
export function parseEventCategory(raw: RawSearchParams): string | undefined {
  const value = Array.isArray(raw.category) ? raw.category[0] : raw.category;
  const category = value?.trim();
  return category && eventCategories.some((item) => item.slug === category) ? category : undefined;
}

export function filterEvents(all: TravelEvent[], category?: string) {
  return category ? all.filter((event) => event.category === category) : all;
}

// Cantidad de eventos por categoría (0 para las que no tienen).
export function eventCategoryCounts(all: TravelEvent[]): Record<string, number> {
  return Object.fromEntries(
    eventCategories.map((category) => [
      category.slug,
      all.filter((event) => event.category === category.slug).length,
    ]),
  );
}

export function eventsHref(category?: string) {
  return category ? `/events?category=${category}` : "/events";
}
