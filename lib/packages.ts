// Lógica pura del catálogo de paquetes: lectura de la URL, filtros, orden y enlaces.
// Regla central: un filtro solo se APLICA si el catálogo tiene datos de ese atributo. Si ningún paquete
// tiene duración, por ejemplo, elegir "4 a 7 días" no vacía la lista: el criterio se conserva como
// "preferencia" y viaja a la cotización. Así el catálogo nunca simula información que no tiene.
import { availabilityLabels, includeLabels, type SortKey, sortLabels } from "@/config/packages";
import { budgetOptions } from "@/config/search";
import type { PackageAvailability, TravelPackage } from "@/data/packages";

export type RawSearchParams = Record<string, string | string[] | undefined>;
export type IncludeKey = keyof typeof includeLabels;

export type FilterId =
  | "destination"
  | "region"
  | "type"
  | "duration"
  | "season"
  | "board"
  | "availability"
  | "tag"
  | "price"
  | "flights"
  | "transfers"
  | "excursions"
  | "date"
  | "travelers"
  | "budget";

export type PackageQuery = {
  destination?: string;
  region?: string;
  type?: string;
  duration?: string;
  season?: string;
  board?: string;
  availability?: string;
  tag?: string;
  priceMin?: number;
  priceMax?: number;
  flights?: boolean;
  transfers?: boolean;
  excursions?: boolean;
  // Solo preferencias: nunca filtran, viajan a la cotización.
  date?: string;
  travelers?: string;
  budget?: string;
  sort: SortKey;
};

// Rangos de los valores de `durationOptions` (config/search.ts). Un valor sin rango se ignora.
const DURATION_RANGES: Record<string, [number, number]> = {
  "1-3": [1, 3],
  "4-7": [4, 7],
  "8-14": [8, 14],
  "15+": [15, Infinity],
};

// Parámetros de URL de cada filtro, en el orden en que se escriben.
const FILTER_PARAMS: Record<FilterId, string[]> = {
  destination: ["destination"],
  region: ["region"],
  type: ["type"],
  duration: ["duration"],
  season: ["season"],
  board: ["board"],
  availability: ["availability"],
  tag: ["tag"],
  price: ["price_min", "price_max"],
  flights: ["flights"],
  transfers: ["transfers"],
  excursions: ["excursions"],
  date: ["date"],
  travelers: ["travelers"],
  budget: ["budget"],
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function cleanText(value: string | string[] | undefined, max = 80) {
  const text = firstValue(value)?.trim();
  return text ? text.slice(0, max) : undefined;
}

function cleanNumber(value: string | string[] | undefined) {
  const text = firstValue(value)?.trim();
  if (!text) return undefined;
  const number = Number(text);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Convierte los parámetros de la URL en una consulta validada: lo que no es válido se descarta.
export function parseQuery(raw: RawSearchParams): PackageQuery {
  const duration = cleanText(raw.duration, 10);
  const availability = cleanText(raw.availability, 20);
  const budget = cleanText(raw.budget, 20);
  const date = cleanText(raw.date, 10);
  const travelers = cleanText(raw.travelers, 3);
  const sort = cleanText(raw.sort, 20);
  const flag = (value: string | string[] | undefined) =>
    cleanText(value, 1) === "1" ? true : undefined;

  return {
    destination: cleanText(raw.destination),
    region: cleanText(raw.region, 60),
    type: cleanText(raw.type, 60),
    duration: duration && Object.hasOwn(DURATION_RANGES, duration) ? duration : undefined,
    season: cleanText(raw.season, 60),
    board: cleanText(raw.board, 60),
    availability:
      availability && Object.hasOwn(availabilityLabels, availability) ? availability : undefined,
    tag: cleanText(raw.tag, 60),
    priceMin: cleanNumber(raw.price_min),
    priceMax: cleanNumber(raw.price_max),
    flights: flag(raw.flights),
    transfers: flag(raw.transfers),
    excursions: flag(raw.excursions),
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    travelers: travelers && /^\d{1,2}$/.test(travelers) && Number(travelers) >= 1 ? travelers : undefined,
    budget: budget && budgetOptions.some((option) => option.value === budget) ? budget : undefined,
    sort: sort && Object.hasOwn(sortLabels, sort) ? (sort as SortKey) : "relevance",
  };
}

// Qué ofrece el catálogo: de aquí salen las opciones de los filtros y del orden.
export type Facets = {
  regions: string[];
  types: string[];
  seasons: string[];
  boards: string[];
  tags: string[];
  availabilities: PackageAvailability[];
  hasDuration: boolean;
  // Solo si todos los paquetes con precio comparten moneda (no se comparan monedas distintas).
  price: { currency: string; min: number; max: number } | null;
  hasPopularity: boolean;
  hasDeparture: boolean;
  hasFeatured: boolean;
  includes: Record<IncludeKey, boolean>;
};

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "es"));
}

export function getFacets(packages: TravelPackage[]): Facets {
  const priced = packages.flatMap((pkg) => (pkg.price ? [pkg.price] : []));
  const currencies = new Set(priced.map((price) => price.currency));
  const amounts = priced.map((price) => price.amount);
  const availabilities = new Set(packages.map((pkg) => pkg.availability));
  const known = <T>(values: Array<T | null>) => values.filter((value): value is T => value !== null);

  return {
    regions: unique(packages.map((pkg) => pkg.region)),
    types: unique(packages.flatMap((pkg) => pkg.types)),
    seasons: unique(known(packages.map((pkg) => pkg.season))),
    boards: unique(known(packages.map((pkg) => pkg.board))),
    tags: unique(known(packages.map((pkg) => pkg.badge))),
    availabilities: (Object.keys(availabilityLabels) as PackageAvailability[]).filter((key) =>
      availabilities.has(key),
    ),
    hasDuration: packages.some((pkg) => pkg.durationDays !== null),
    price:
      priced.length > 0 && currencies.size === 1
        ? { currency: priced[0].currency, min: Math.min(...amounts), max: Math.max(...amounts) }
        : null,
    hasPopularity: packages.some((pkg) => pkg.popularity !== null),
    hasDeparture: packages.some((pkg) => pkg.nextDeparture !== null),
    hasFeatured: packages.some((pkg) => pkg.featured),
    includes: {
      flights: packages.some((pkg) => pkg.includes.flights !== null),
      transfers: packages.some((pkg) => pkg.includes.transfers !== null),
      excursions: packages.some((pkg) => pkg.includes.excursions !== null),
    },
  };
}

export function availableSorts(facets: Facets): SortKey[] {
  const sorts: SortKey[] = ["relevance"];
  if (facets.hasFeatured) sorts.push("featured");
  if (facets.price) sorts.push("price_asc", "price_desc");
  if (facets.hasDuration) sorts.push("duration_asc", "duration_desc");
  if (facets.hasPopularity) sorts.push("popular");
  if (facets.hasDeparture) sorts.push("departure");
  return sorts;
}

// Comparadores: los valores desconocidos (null) siempre quedan al final.
const byNumber = (a: number | null, b: number | null, direction: 1 | -1) =>
  a === null ? (b === null ? 0 : 1) : b === null ? -1 : (a - b) * direction;

function sortPackages(list: TravelPackage[], sort: SortKey) {
  const sorted = [...list]; // Array.prototype.sort es estable: los empates conservan el orden original
  switch (sort) {
    case "featured":
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    case "price_asc":
      return sorted.sort((a, b) => byNumber(a.price?.amount ?? null, b.price?.amount ?? null, 1));
    case "price_desc":
      return sorted.sort((a, b) => byNumber(a.price?.amount ?? null, b.price?.amount ?? null, -1));
    case "duration_asc":
      return sorted.sort((a, b) => byNumber(a.durationDays, b.durationDays, 1));
    case "duration_desc":
      return sorted.sort((a, b) => byNumber(a.durationDays, b.durationDays, -1));
    case "popular":
      return sorted.sort((a, b) => byNumber(a.popularity, b.popularity, -1));
    case "departure":
      return sorted.sort((a, b) =>
        byNumber(
          a.nextDeparture ? Date.parse(a.nextDeparture) : null,
          b.nextDeparture ? Date.parse(b.nextDeparture) : null,
          1,
        ),
      );
    default:
      return sorted;
  }
}

export type QueryResult = {
  results: TravelPackage[];
  // Orden realmente usado (si el pedido no está disponible, "relevance").
  sort: SortKey;
  // Criterios pedidos que NO filtran (fecha, viajeros, presupuesto y los que el catálogo no puede evaluar).
  preferences: FilterId[];
};

export function applyQuery(packages: TravelPackage[], query: PackageQuery, facets: Facets): QueryResult {
  const checks: Array<(pkg: TravelPackage) => boolean> = [];
  const preferences: FilterId[] = [];

  if (query.destination) {
    const needle = normalizeText(query.destination);
    checks.push((pkg) => normalizeText(`${pkg.name} ${pkg.destination}`).includes(needle));
  }
  if (query.region) checks.push((pkg) => pkg.region === query.region);
  if (query.type) checks.push((pkg) => pkg.types.includes(query.type as string));

  if (query.duration) {
    const [min, max] = DURATION_RANGES[query.duration];
    if (facets.hasDuration) {
      checks.push((pkg) => pkg.durationDays !== null && pkg.durationDays >= min && pkg.durationDays <= max);
    } else {
      preferences.push("duration");
    }
  }
  if (query.season) {
    if (facets.seasons.length > 0) checks.push((pkg) => pkg.season === query.season);
    else preferences.push("season");
  }
  if (query.board) {
    if (facets.boards.length > 0) checks.push((pkg) => pkg.board === query.board);
    else preferences.push("board");
  }
  if (query.availability) {
    if (facets.availabilities.length > 0) checks.push((pkg) => pkg.availability === query.availability);
    else preferences.push("availability");
  }
  if (query.tag) {
    if (facets.tags.length > 0) checks.push((pkg) => pkg.badge === query.tag);
    else preferences.push("tag");
  }
  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    if (facets.price) {
      const min = query.priceMin ?? 0;
      const max = query.priceMax ?? Infinity;
      checks.push((pkg) => pkg.price !== null && pkg.price.amount >= min && pkg.price.amount <= max);
    } else {
      preferences.push("price");
    }
  }
  for (const key of Object.keys(includeLabels) as IncludeKey[]) {
    if (!query[key]) continue;
    if (facets.includes[key]) checks.push((pkg) => pkg.includes[key] === true);
    else preferences.push(key);
  }
  for (const key of ["date", "travelers", "budget"] as const) {
    if (query[key]) preferences.push(key);
  }

  const filtered = packages.filter((pkg) => checks.every((check) => check(pkg)));
  const sort = availableSorts(facets).includes(query.sort) ? query.sort : "relevance";
  return { results: sortPackages(filtered, sort), sort, preferences };
}

function isActive(query: PackageQuery, id: FilterId) {
  switch (id) {
    case "price":
      return query.priceMin !== undefined || query.priceMax !== undefined;
    case "flights":
    case "transfers":
    case "excursions":
      return query[id] === true;
    default:
      return query[id] !== undefined;
  }
}

// Filtros y preferencias presentes en la consulta (para las etiquetas de "filtros activos").
export function activeFilters(query: PackageQuery) {
  return (Object.keys(FILTER_PARAMS) as FilterId[])
    .filter((id) => isActive(query, id))
    .map((id) => ({ id, params: FILTER_PARAMS[id] }));
}

// Parámetros de URL de la consulta, sin los indicados en `omit`.
export function queryToParams(query: PackageQuery, omit: string[] = []) {
  const params = new URLSearchParams();
  const set = (name: string, value: string | number | undefined) => {
    if (value !== undefined && !omit.includes(name)) params.set(name, String(value));
  };
  set("destination", query.destination);
  set("region", query.region);
  set("type", query.type);
  set("duration", query.duration);
  set("season", query.season);
  set("board", query.board);
  set("availability", query.availability);
  set("tag", query.tag);
  set("price_min", query.priceMin);
  set("price_max", query.priceMax);
  set("flights", query.flights ? "1" : undefined);
  set("transfers", query.transfers ? "1" : undefined);
  set("excursions", query.excursions ? "1" : undefined);
  set("date", query.date);
  set("travelers", query.travelers);
  set("budget", query.budget);
  set("sort", query.sort === "relevance" ? undefined : query.sort);
  return params;
}

export function packagesHref(query: PackageQuery, omit: string[] = []) {
  const search = queryToParams(query, omit).toString();
  return search ? `/packages?${search}` : "/packages";
}

// Enlace a la cotización llevando lo que el usuario buscó (lo lee M9).
export function quoteHref(query: PackageQuery) {
  const params = new URLSearchParams();
  for (const [name, value] of [
    ["destination", query.destination],
    ["type", query.type],
    ["date", query.date],
    ["duration", query.duration],
    ["travelers", query.travelers],
    ["budget", query.budget],
  ] as const) {
    if (value) params.set(name, value);
  }
  const search = params.toString();
  return search ? `/quote?${search}` : "/quote";
}

// Paquetes relacionados con `current`: misma región (2 puntos) y tipos de viaje en común (1 punto cada uno).
// Solo se incluyen los que tienen algo en común; a igual puntaje se conserva el orden original.
export function relatedPackages(current: TravelPackage, all: TravelPackage[], limit = 3) {
  return all
    .map((pkg, index) => ({
      pkg,
      index,
      score:
        (pkg.region === current.region ? 2 : 0) +
        pkg.types.filter((type) => current.types.includes(type)).length,
    }))
    .filter(({ pkg, score }) => pkg.slug !== current.slug && score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ pkg }) => pkg);
}
