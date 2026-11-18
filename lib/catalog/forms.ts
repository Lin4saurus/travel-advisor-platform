// Formularios del catálogo en el panel admin (M12 fase 2). Lógica pura: la usan el formulario del navegador
// (para pintar los campos) y el servidor (para convertir lo enviado y validarlo). Un solo lugar define qué campos
// tiene cada tipo, cómo se muestran y cómo se traducen al tipo de `data/*.ts`.
//
// Convenciones de los campos de texto múltiple:
// - "lines": un elemento por línea (incluye, galería…).
// - "blocks": bloques separados por una línea en blanco; la primera línea es el título (o la pregunta) y el resto
//   la descripción (o la respuesta). Se usa para el itinerario y las preguntas frecuentes.
import { availabilityLabels } from "@/config/packages";
import { eventStatusLabels } from "@/config/events";
import { categories } from "@/data/categories";
import { eventCategories } from "@/data/events";
import { experienceCategories } from "@/data/experiences";
import {
  CURRENCIES,
  EVENT_STATUSES,
  LIMITS,
  PLACEHOLDER_IMAGE,
  isISODate,
  isImagePath,
  isSlug,
  normalizers,
  slugify,
  type CatalogDataMap,
  type CatalogKind,
} from "@/lib/catalog/normalize";

export type FormValues = Record<string, string | string[]>;
export type FormErrors = Record<string, string>;

type Option = { value: string; label: string };

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "checkboxes" | "lines" | "blocks";
  hint?: string;
  required?: boolean;
  options?: Option[];
  // Opciones que solo se conocen en tiempo de ejecución (p. ej. los destinos de la base de datos).
  dynamicOptions?: "destinations";
  rows?: number;
  maxLength?: number;
};

export type FormSection = { title: string; fields: FieldDef[] };

export const kindLabels: Record<CatalogKind, { plural: string; singular: string; publicPath: string }> = {
  packages: { plural: "Paquetes", singular: "paquete", publicPath: "/packages" },
  destinations: { plural: "Destinos", singular: "destino", publicPath: "/destinations" },
  experiences: { plural: "Experiencias", singular: "experiencia", publicPath: "/experiences" },
  events: { plural: "Eventos", singular: "evento", publicPath: "/events" },
};

// Slugs que chocarían con rutas estáticas hermanas de `[slug]`: "bolivia" en el sitio
// (ver app/destinations/[slug]/page.tsx) y "new" en el panel (/admin/catalog/<tipo>/new).
export const RESERVED_SLUGS: Record<CatalogKind, string[]> = {
  packages: ["new"],
  destinations: ["new", "bolivia"],
  experiences: ["new"],
  events: ["new"],
};

const toOptions = (list: { slug: string; name: string }[]): Option[] =>
  list.map((item) => ({ value: item.slug, label: item.name }));

const UNKNOWN = { value: "", label: "Sin confirmar" };
const triOptions: Option[] = [UNKNOWN, { value: "yes", label: "Sí, incluido" }, { value: "no", label: "No incluido" }];
const availabilityOptions: Option[] = [
  UNKNOWN,
  ...Object.entries(availabilityLabels).map(([value, label]) => ({ value, label })),
];

const IMAGE_HINT = "Ruta de una foto dentro de public/images, p. ej. /images/packages/mi-paquete/main.jpg. Vacío = sin foto (se muestra el diseño de respaldo).";
const GALLERY_HINT = "Una ruta por línea (opcional).";

const base = (singular: string): FieldDef[] => [
  { name: "name", label: "Nombre", type: "text", required: true, maxLength: LIMITS.name },
  {
    name: "slug",
    label: "Identificador en la URL",
    type: "text",
    maxLength: 60,
    hint: `Solo minúsculas, números y guiones. Vacío = se genera desde el nombre. No se puede cambiar después de crear el ${singular} (rompería los enlaces y las cotizaciones que lo mencionan).`,
  },
  { name: "sortOrder", label: "Orden", type: "number", hint: "Menor aparece primero." },
];

export const formSections: Record<CatalogKind, FormSection[]> = {
  packages: [
    { title: "Datos principales", fields: base("paquete") },
    {
      title: "Destino y tipo",
      fields: [
        { name: "destination", label: "Destino (texto visible)", type: "text", maxLength: LIMITS.short, hint: "P. ej. «Cartagena, Colombia»." },
        { name: "destinationSlug", label: "Destino enlazado", type: "select", dynamicOptions: "destinations", hint: "Muestra «Sobre el destino» en el detalle." },
        { name: "region", label: "Región", type: "text", maxLength: LIMITS.short, hint: "Agrupación del filtro «Región», p. ej. «Caribe» o «Bolivia»." },
        { name: "types", label: "Tipos de viaje", type: "checkboxes", options: toOptions(categories) },
      ],
    },
    {
      title: "Textos e imágenes",
      fields: [
        { name: "summary", label: "Resumen (tarjeta)", type: "textarea", rows: 2, maxLength: LIMITS.summary },
        { name: "description", label: "Descripción (detalle)", type: "textarea", rows: 5, maxLength: LIMITS.description },
        { name: "image", label: "Foto principal", type: "text", hint: IMAGE_HINT },
        { name: "gallery", label: "Galería", type: "lines", rows: 4, hint: GALLERY_HINT },
      ],
    },
    {
      title: "Precio, fechas y disponibilidad",
      fields: [
        { name: "priceAmount", label: "Precio desde", type: "number", hint: "Vacío = «Consultar precio»." },
        { name: "priceCurrency", label: "Moneda", type: "select", options: CURRENCIES.map((value) => ({ value, label: value })) },
        { name: "durationDays", label: "Duración (días)", type: "number", hint: "Vacío = «Duración a consultar»." },
        { name: "season", label: "Temporada", type: "text", maxLength: LIMITS.short },
        { name: "nextDeparture", label: "Próxima salida", type: "date" },
        { name: "availability", label: "Disponibilidad", type: "select", options: availabilityOptions },
      ],
    },
    {
      title: "Qué incluye",
      fields: [
        { name: "board", label: "Régimen", type: "text", maxLength: LIMITS.short, hint: "P. ej. «Todo incluido»." },
        { name: "includesFlights", label: "Vuelos", type: "select", options: triOptions },
        { name: "includesTransfers", label: "Traslados", type: "select", options: triOptions },
        { name: "includesExcursions", label: "Excursiones", type: "select", options: triOptions },
        { name: "included", label: "Otros servicios incluidos", type: "lines", rows: 4, hint: "Uno por línea." },
        { name: "excluded", label: "No incluye", type: "lines", rows: 3, hint: "Uno por línea." },
        { name: "optionals", label: "Opcionales", type: "lines", rows: 3, hint: "Uno por línea." },
      ],
    },
    {
      title: "Itinerario y preguntas",
      fields: [
        { name: "itinerary", label: "Itinerario", type: "blocks", rows: 8, hint: "Un día por bloque, separados por una línea en blanco. Primera línea: título del día; el resto: descripción." },
        { name: "faq", label: "Preguntas propias del paquete", type: "blocks", rows: 6, hint: "Una pregunta por bloque, separados por una línea en blanco. Primera línea: pregunta; el resto: respuesta." },
      ],
    },
    {
      title: "Destacar y ordenar en el catálogo",
      fields: [
        { name: "featured", label: "Destacado", type: "checkbox" },
        { name: "badge", label: "Etiqueta", type: "text", maxLength: 30, hint: "P. ej. «Oferta». Vacío = sin etiqueta." },
        { name: "popularity", label: "Popularidad", type: "number", hint: "Para el orden «Más populares» (mayor = más popular)." },
      ],
    },
  ],
  destinations: [
    { title: "Datos principales", fields: base("destino") },
    {
      title: "Ubicación y tipo",
      fields: [
        { name: "scope", label: "Alcance", type: "select", options: [{ value: "international", label: "Internacional" }, { value: "national", label: "Nacional (Bolivia)" }] },
        { name: "location", label: "País o región", type: "text", maxLength: LIMITS.short },
        { name: "experienceTypes", label: "Tipos de viaje", type: "checkboxes", options: toOptions(categories) },
        { name: "featured", label: "Destacado en la página de inicio", type: "checkbox" },
      ],
    },
    {
      title: "Textos e imágenes",
      fields: [
        { name: "summary", label: "Resumen", type: "textarea", rows: 2, maxLength: LIMITS.summary },
        { name: "description", label: "Descripción", type: "textarea", rows: 5, maxLength: LIMITS.description },
        { name: "image", label: "Foto principal", type: "text", hint: IMAGE_HINT },
        { name: "gallery", label: "Galería", type: "lines", rows: 3, hint: GALLERY_HINT },
      ],
    },
  ],
  experiences: [
    { title: "Datos principales", fields: base("experiencia") },
    {
      title: "Detalles",
      fields: [
        { name: "categories", label: "Categorías", type: "checkboxes", options: toOptions(experienceCategories) },
        { name: "location", label: "Ciudad o lugar", type: "text", maxLength: LIMITS.short, hint: "Vacío = «Ciudad a consultar»." },
        { name: "duration", label: "Duración", type: "text", maxLength: 40, hint: "Texto libre, p. ej. «3 horas»." },
        { name: "availability", label: "Disponibilidad", type: "select", options: availabilityOptions },
        { name: "includes", label: "Incluye", type: "lines", rows: 3, hint: "Uno por línea." },
        { name: "featured", label: "Destacada en la página de inicio", type: "checkbox" },
      ],
    },
    {
      title: "Textos e imagen",
      fields: [
        { name: "summary", label: "Resumen", type: "textarea", rows: 2, maxLength: LIMITS.summary },
        { name: "description", label: "Descripción", type: "textarea", rows: 5, maxLength: LIMITS.description },
        { name: "image", label: "Foto", type: "text", hint: IMAGE_HINT },
      ],
    },
  ],
  events: [
    { title: "Datos principales", fields: base("evento") },
    {
      title: "Detalles",
      fields: [
        { name: "category", label: "Categoría", type: "select", options: toOptions(eventCategories) },
        { name: "status", label: "Estado del evento", type: "select", options: EVENT_STATUSES.map((value) => ({ value, label: eventStatusLabels[value] })), hint: "Solo «confirmado» con datos verificados." },
        { name: "isExample", label: "Es un ejemplo ilustrativo (no un evento real)", type: "checkbox", hint: "Muestra la marca «Ejemplo ilustrativo». Desmárcalo solo para eventos reales." },
        { name: "city", label: "Ciudad", type: "text", maxLength: LIMITS.short },
        { name: "date", label: "Fecha", type: "date", hint: "Vacío = «Fecha por confirmar»." },
        { name: "duration", label: "Duración", type: "text", maxLength: 40 },
        { name: "includes", label: "Incluye", type: "lines", rows: 3, hint: "Uno por línea." },
      ],
    },
    {
      title: "Textos e imagen",
      fields: [
        { name: "summary", label: "Resumen", type: "textarea", rows: 3, maxLength: LIMITS.summary },
        { name: "image", label: "Foto", type: "text", hint: IMAGE_HINT },
      ],
    },
  ],
};

export function allFields(kind: CatalogKind): FieldDef[] {
  return formSections[kind].flatMap((section) => section.fields);
}

// ---------------------------------------------------------------------------------------------------------------
// Conversión formulario ⇄ datos

const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

function blocks(value: string): { head: string; body: string }[] {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
    .filter((block) => block.length > 0)
    .map(([head, ...rest]) => ({ head, body: rest.join("\n") }));
}

const joinBlocks = (items: { head: string; body: string }[]) =>
  items.map((item) => (item.body ? `${item.head}\n${item.body}` : item.head)).join("\n\n");

const tri = (value: boolean | null) => (value === true ? "yes" : value === false ? "no" : "");
const fromTri = (value: string) => (value === "yes" ? true : value === "no" ? false : null);
const str = (value: string | number | null | undefined) => (value === null || value === undefined ? "" : String(value));
const check = (value: boolean) => (value ? "on" : "");
// La imagen de "sin foto" es interna: en el formulario se muestra como campo vacío.
const shownImage = (value: string) => (value === PLACEHOLDER_IMAGE ? "" : value);

// Valores iniciales de un elemento nuevo.
export function emptyValues(kind: CatalogKind): FormValues {
  const values: FormValues = { sortOrder: "100" };
  if (kind === "packages") values.priceCurrency = "USD";
  if (kind === "destinations") values.scope = "international";
  if (kind === "events") {
    values.status = "por-confirmar";
    values.isExample = "on";
    values.category = eventCategories[0]?.slug ?? "";
  }
  return values;
}

export function toFormValues<K extends CatalogKind>(kind: K, item: CatalogDataMap[K], sortOrder: number): FormValues {
  const common = { name: item.name, slug: item.slug, sortOrder: String(sortOrder) };
  if (kind === "packages") {
    const p = item as CatalogDataMap["packages"];
    return {
      ...common,
      destination: p.destination,
      destinationSlug: p.destinationSlug ?? "",
      region: p.region,
      types: p.types,
      summary: p.summary,
      description: p.description,
      image: shownImage(p.image),
      gallery: p.gallery.join("\n"),
      priceAmount: str(p.price?.amount),
      priceCurrency: p.price?.currency ?? "USD",
      durationDays: str(p.durationDays),
      season: str(p.season),
      nextDeparture: str(p.nextDeparture),
      availability: str(p.availability),
      board: str(p.board),
      includesFlights: tri(p.includes.flights),
      includesTransfers: tri(p.includes.transfers),
      includesExcursions: tri(p.includes.excursions),
      included: p.included.join("\n"),
      excluded: p.excluded.join("\n"),
      optionals: p.optionals.join("\n"),
      itinerary: joinBlocks(p.itinerary.map((day) => ({ head: day.title, body: day.description }))),
      faq: joinBlocks(p.faq.map((entry) => ({ head: entry.question, body: entry.answer }))),
      featured: check(p.featured),
      badge: str(p.badge),
      popularity: str(p.popularity),
    };
  }
  if (kind === "destinations") {
    const d = item as CatalogDataMap["destinations"];
    return {
      ...common,
      scope: d.scope,
      location: d.location,
      experienceTypes: d.experienceTypes,
      featured: check(d.featured),
      summary: d.summary,
      description: d.description,
      image: shownImage(d.image),
      gallery: d.gallery.join("\n"),
    };
  }
  if (kind === "experiences") {
    const e = item as CatalogDataMap["experiences"];
    return {
      ...common,
      categories: e.categories,
      location: str(e.location),
      duration: str(e.duration),
      availability: str(e.availability),
      includes: e.includes.join("\n"),
      featured: check(e.featured),
      summary: e.summary,
      description: e.description,
      image: shownImage(e.image),
    };
  }
  const ev = item as CatalogDataMap["events"];
  return {
    ...common,
    category: ev.category,
    status: ev.status,
    isExample: check(ev.isExample),
    city: str(ev.city),
    date: str(ev.date),
    duration: str(ev.duration),
    includes: ev.includes.join("\n"),
    summary: ev.summary,
    image: shownImage(ev.image),
  };
}

// Lee un FormData a `FormValues` usando la definición de campos (lo que no está definido se ignora).
export function readFormData(kind: CatalogKind, formData: FormData): FormValues {
  const values: FormValues = {};
  for (const field of allFields(kind)) {
    if (field.type === "checkboxes") {
      values[field.name] = formData
        .getAll(field.name)
        .filter((value): value is string => typeof value === "string")
        .slice(0, 30);
    } else {
      const value = formData.get(field.name);
      values[field.name] = typeof value === "string" ? value.slice(0, 20_000) : "";
    }
  }
  return values;
}

export type ParsedItem<K extends CatalogKind> =
  | { ok: true; item: CatalogDataMap[K]; sortOrder: number }
  | { ok: false; errors: FormErrors };

// Convierte lo enviado en un elemento válido, o devuelve los errores por campo. Nunca rellena con datos
// inventados: un número o una fecha mal escritos son un error (no un `null` silencioso).
export function parseFormValues<K extends CatalogKind>(
  kind: K,
  values: FormValues,
  options: { fixedSlug?: string; destinationSlugs?: string[] },
): ParsedItem<K> {
  const errors: FormErrors = {};
  const get = (name: string) => {
    const value = values[name];
    return typeof value === "string" ? value.trim() : "";
  };
  const list = (name: string, allowed?: Option[]) => {
    const value = values[name];
    const items = Array.isArray(value) ? value : [];
    return allowed ? items.filter((item) => allowed.some((option) => option.value === item)) : items;
  };
  const number = (name: string, min: number, max: number) => {
    const raw = get(name);
    if (!raw) return null;
    const n = Number(raw.replace(",", "."));
    if (!Number.isFinite(n) || n < min || n > max) {
      errors[name] = `Escribe un número entre ${min} y ${max}, o déjalo vacío.`;
      return null;
    }
    return n;
  };
  const integer = (name: string, min: number, max: number) => {
    const n = number(name, min, max);
    if (n !== null && !Number.isInteger(n)) {
      errors[name] = "Escribe un número entero.";
      return null;
    }
    return n;
  };
  const date = (name: string) => {
    const raw = get(name);
    if (!raw) return null;
    if (!isISODate(raw)) {
      errors[name] = "Fecha inválida.";
      return null;
    }
    return raw;
  };
  const image = (name: string) => {
    const raw = get(name);
    if (!raw) return null;
    if (!isImagePath(raw)) {
      errors[name] = "Debe empezar con /images/ y terminar en .jpg, .jpeg, .png, .webp o .avif.";
      return null;
    }
    return raw;
  };
  const imageLines = (name: string) => {
    const items = lines(get(name));
    // `: boolean` explícito: si no, TypeScript infiere un predicado de tipo y `bad` queda como `never`.
    const bad = items.find((item): boolean => !isImagePath(item));
    if (bad) errors[name] = `Ruta inválida: «${bad.slice(0, 60)}». Cada línea debe empezar con /images/.`;
    return items.filter(isImagePath);
  };

  const name = get("name");
  if (!name) errors.name = "El nombre es obligatorio.";

  let slug = options.fixedSlug ?? (get("slug") || slugify(name));
  if (options.fixedSlug === undefined) {
    if (!isSlug(slug)) {
      errors.slug = "Usa solo minúsculas sin acentos, números y guiones (máx. 60).";
    } else if (RESERVED_SLUGS[kind].includes(slug)) {
      errors.slug = `«${slug}» está reservado por otra página del sitio. Elige otro.`;
    }
  }
  slug = slug || "x";
  const sortOrder = integer("sortOrder", -100_000, 100_000) ?? 100;

  let raw: Record<string, unknown>;
  if (kind === "packages") {
    const amount = number("priceAmount", 1, 9_999_999);
    const currency = get("priceCurrency");
    if (amount !== null && !(CURRENCIES as readonly string[]).includes(currency)) {
      errors.priceCurrency = "Elige la moneda del precio.";
    }
    const destinationSlug = get("destinationSlug");
    raw = {
      slug,
      name,
      destination: get("destination"),
      destinationSlug:
        destinationSlug && (options.destinationSlugs ?? []).includes(destinationSlug) ? destinationSlug : null,
      region: get("region"),
      types: list("types", toOptions(categories)),
      summary: get("summary"),
      description: get("description"),
      image: image("image"),
      gallery: imageLines("gallery"),
      price: amount === null ? null : { amount, currency },
      durationDays: integer("durationDays", 1, 365),
      season: get("season"),
      nextDeparture: date("nextDeparture"),
      availability: get("availability") || null,
      board: get("board"),
      includes: {
        flights: fromTri(get("includesFlights")),
        transfers: fromTri(get("includesTransfers")),
        excursions: fromTri(get("includesExcursions")),
      },
      included: lines(get("included")),
      excluded: lines(get("excluded")),
      optionals: lines(get("optionals")),
      itinerary: blocks(get("itinerary")).map((block) => ({ title: block.head, description: block.body })),
      faq: blocks(get("faq")).map((block) => ({ question: block.head, answer: block.body })),
      featured: get("featured") === "on",
      badge: get("badge"),
      popularity: integer("popularity", 0, 1_000_000),
    };
    const faqWithoutAnswer = blocks(get("faq")).find((block) => !block.body);
    if (faqWithoutAnswer) errors.faq = `Falta la respuesta de «${faqWithoutAnswer.head.slice(0, 60)}».`;
  } else if (kind === "destinations") {
    raw = {
      slug,
      name,
      scope: get("scope") === "national" ? "national" : "international",
      location: get("location"),
      experienceTypes: list("experienceTypes", toOptions(categories)),
      featured: get("featured") === "on",
      summary: get("summary"),
      description: get("description"),
      image: image("image"),
      gallery: imageLines("gallery"),
    };
  } else if (kind === "experiences") {
    raw = {
      slug,
      name,
      categories: list("categories", toOptions(experienceCategories)),
      location: get("location"),
      duration: get("duration"),
      availability: get("availability") || null,
      includes: lines(get("includes")),
      featured: get("featured") === "on",
      summary: get("summary"),
      description: get("description"),
      image: image("image"),
    };
  } else {
    const category = get("category");
    if (!eventCategories.some((item) => item.slug === category)) errors.category = "Elige una categoría.";
    raw = {
      slug,
      name,
      category,
      status: get("status"),
      isExample: get("isExample") === "on",
      city: get("city"),
      date: date("date"),
      duration: get("duration"),
      includes: lines(get("includes")),
      summary: get("summary"),
      image: image("image"),
    };
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const item = normalizers[kind](raw) as CatalogDataMap[K] | null;
  if (!item) return { ok: false, errors: { name: "Revisa el nombre y el identificador." } };
  return { ok: true, item, sortOrder };
}
