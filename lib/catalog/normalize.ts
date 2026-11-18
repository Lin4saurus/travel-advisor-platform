// Normalización de los elementos del catálogo (M12 fase 2). Lógica pura, sin React ni Supabase.
//
// Convierte cualquier valor `unknown` (una fila JSONB leída de Supabase, o lo que armó el formulario del panel)
// en el tipo exacto que usan las páginas (`data/*.ts`). Se usa en los dos sentidos:
// - al LEER: una fila editada a mano en el SQL Editor con un campo raro no rompe la página; si falta lo
//   esencial (slug, nombre) la fila se descarta;
// - al GUARDAR: el servidor nunca confía en la forma de lo que llega (ver lib/admin/catalog.ts).
// Regla del proyecto: `null` = dato desconocido. Nada se inventa: un valor inválido pasa a `null`/vacío.
import type { Destination } from "@/data/destinations";
import type { TravelEvent, EventStatus } from "@/data/events";
import type { Experience } from "@/data/experiences";
import type { FaqItem, ItineraryDay, PackageAvailability, TravelPackage } from "@/data/packages";

export const CATALOG_KINDS = ["packages", "destinations", "experiences", "events"] as const;
export type CatalogKind = (typeof CATALOG_KINDS)[number];

export type CatalogDataMap = {
  packages: TravelPackage;
  destinations: Destination;
  experiences: Experience;
  events: TravelEvent;
};

export function isCatalogKind(value: unknown): value is CatalogKind {
  return typeof value === "string" && (CATALOG_KINDS as readonly string[]).includes(value);
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 60;

export function isSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= SLUG_MAX && SLUG_PATTERN.test(value);
}

// "Cartagena y el Caribe" → "cartagena-y-el-caribe"
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
}

type Obj = Record<string, unknown>;
const obj = (value: unknown): Obj => (value && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : {});

// Quita caracteres de control (salvo saltos de línea y tabulaciones), recorta y acota.
export function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

const textOrNull = (value: unknown, max: number) => text(value, max) || null;

function textList(value: unknown, maxItems: number, maxLen: number, allowed?: readonly string[]): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const cleaned = text(item, maxLen);
    if (!cleaned || out.includes(cleaned) || (allowed && !allowed.includes(cleaned))) continue;
    out.push(cleaned);
    if (out.length >= maxItems) break;
  }
  return out;
}

const bool = (value: unknown) => value === true;
const triState = (value: unknown): boolean | null => (value === true ? true : value === false ? false : null);

function intOrNull(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export function isISODate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const dateOrNull = (value: unknown) => (isISODate(value) ? value : null);

// Solo fotos del propio sitio (`/images/...`): `next/image` no tiene dominios externos configurados y así nadie
// puede apuntar una tarjeta a una URL ajena. Sin `..` ni barras invertidas.
export function isImagePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 200 &&
    /^\/images\/[A-Za-z0-9/_.-]+\.(jpe?g|png|webp|avif)$/i.test(value) &&
    !value.includes("..") &&
    !value.includes("//")
  );
}

const imageOr = (value: unknown, fallback: string) => (isImagePath(value) ? value : fallback);
const imageList = (value: unknown, maxItems: number) =>
  Array.isArray(value) ? value.filter(isImagePath).slice(0, maxItems) : [];

const AVAILABILITY: readonly PackageAvailability[] = ["available", "limited", "consult"];
const availabilityOrNull = (value: unknown) =>
  AVAILABILITY.includes(value as PackageAvailability) ? (value as PackageAvailability) : null;

export const CURRENCIES = ["USD", "BOB"] as const;

// Imagen genérica para un elemento recién creado sin foto propia: no existe a propósito, así `SafeImage` muestra
// su fallback (degradado + ícono + nombre) en vez de una foto que no corresponde.
export const PLACEHOLDER_IMAGE = "/images/sin-foto.jpg";

export const LIMITS = { name: 100, short: 80, summary: 300, description: 4000, item: 300, list: 30 };

export function normalizePackage(raw: unknown): TravelPackage | null {
  const source = obj(raw);
  const slug = isSlug(source.slug) ? source.slug : null;
  const name = text(source.name, LIMITS.name);
  if (!slug || !name) return null;
  const price = obj(source.price);
  const amount = typeof price.amount === "number" ? price.amount : Number(price.amount);
  const currency = text(price.currency, 3).toUpperCase();
  const includes = obj(source.includes);

  return {
    slug,
    name,
    destination: text(source.destination, LIMITS.short),
    destinationSlug: isSlug(source.destinationSlug) ? source.destinationSlug : null,
    region: text(source.region, LIMITS.short),
    types: textList(source.types, 20, 60),
    summary: text(source.summary, LIMITS.summary),
    description: text(source.description, LIMITS.description),
    image: imageOr(source.image, PLACEHOLDER_IMAGE),
    gallery: imageList(source.gallery, 8),
    durationDays: intOrNull(source.durationDays, 1, 365),
    price:
      Number.isFinite(amount) && amount > 0 && amount < 10_000_000 && /^[A-Z]{3}$/.test(currency)
        ? { amount: Math.round(amount), currency }
        : null,
    season: textOrNull(source.season, LIMITS.short),
    board: textOrNull(source.board, LIMITS.short),
    includes: {
      flights: triState(includes.flights),
      transfers: triState(includes.transfers),
      excursions: triState(includes.excursions),
    },
    included: textList(source.included, LIMITS.list, LIMITS.item),
    excluded: textList(source.excluded, LIMITS.list, LIMITS.item),
    itinerary: (Array.isArray(source.itinerary) ? source.itinerary : [])
      .map((day): ItineraryDay => ({
        title: text(obj(day).title, LIMITS.name),
        description: text(obj(day).description, 2000),
      }))
      .filter((day) => day.title)
      .slice(0, 60),
    optionals: textList(source.optionals, LIMITS.list, LIMITS.item),
    faq: (Array.isArray(source.faq) ? source.faq : [])
      .map((item): FaqItem => ({
        question: text(obj(item).question, LIMITS.item),
        answer: text(obj(item).answer, 2000),
      }))
      .filter((item) => item.question && item.answer)
      .slice(0, 30),
    availability: availabilityOrNull(source.availability),
    badge: textOrNull(source.badge, 30),
    featured: bool(source.featured),
    popularity: intOrNull(source.popularity, 0, 1_000_000),
    nextDeparture: dateOrNull(source.nextDeparture),
  };
}

export function normalizeDestination(raw: unknown): Destination | null {
  const source = obj(raw);
  const slug = isSlug(source.slug) ? source.slug : null;
  const name = text(source.name, LIMITS.name);
  if (!slug || !name) return null;
  return {
    slug,
    name,
    scope: source.scope === "national" ? "national" : "international",
    location: text(source.location, LIMITS.short),
    summary: text(source.summary, LIMITS.summary),
    description: text(source.description, LIMITS.description),
    experienceTypes: textList(source.experienceTypes, 20, 60),
    image: imageOr(source.image, PLACEHOLDER_IMAGE),
    gallery: imageList(source.gallery, 8),
    featured: bool(source.featured),
  };
}

export function normalizeExperience(raw: unknown): Experience | null {
  const source = obj(raw);
  const slug = isSlug(source.slug) ? source.slug : null;
  const name = text(source.name, LIMITS.name);
  if (!slug || !name) return null;
  return {
    slug,
    name,
    summary: text(source.summary, LIMITS.summary),
    description: text(source.description, LIMITS.description),
    image: imageOr(source.image, PLACEHOLDER_IMAGE),
    categories: textList(source.categories, 10, 60),
    location: textOrNull(source.location, LIMITS.short),
    duration: textOrNull(source.duration, 40),
    availability: availabilityOrNull(source.availability),
    includes: textList(source.includes, LIMITS.list, LIMITS.item),
    featured: bool(source.featured),
  };
}

export const EVENT_STATUSES: readonly EventStatus[] = ["por-confirmar", "consultar", "confirmado", "agotado"];

export function normalizeEvent(raw: unknown): TravelEvent | null {
  const source = obj(raw);
  const slug = isSlug(source.slug) ? source.slug : null;
  const name = text(source.name, LIMITS.name);
  if (!slug || !name) return null;
  return {
    slug,
    name,
    category: text(source.category, 60),
    summary: text(source.summary, LIMITS.summary),
    image: imageOr(source.image, PLACEHOLDER_IMAGE),
    city: textOrNull(source.city, LIMITS.short),
    date: dateOrNull(source.date),
    duration: textOrNull(source.duration, 40),
    includes: textList(source.includes, LIMITS.list, LIMITS.item),
    status: EVENT_STATUSES.includes(source.status as EventStatus) ? (source.status as EventStatus) : "por-confirmar",
    // Por defecto se asume ejemplo (más prudente: no presentar como real algo no verificado).
    isExample: source.isExample !== false,
  };
}

export const normalizers: { [K in CatalogKind]: (raw: unknown) => CatalogDataMap[K] | null } = {
  packages: normalizePackage,
  destinations: normalizeDestination,
  experiences: normalizeExperience,
  events: normalizeEvent,
};
