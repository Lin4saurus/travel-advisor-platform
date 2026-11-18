// Modo kiosco (`/kiosco`): pantalla táctil para la agencia. Secciones, filtros y textos. Lógica pura.
//
// Decisiones (ver CLAUDE.md):
// - El kiosco NO pide datos personales en la pantalla (es un equipo compartido): para cotizar muestra un QR que
//   abre el formulario normal (`/quote?…`) en el celular de la persona.
// - Solo navega dentro de `/kiosco` (sin enlaces a otras webs, al correo ni al panel).
// - Tras un rato sin uso vuelve solo al inicio (components/kiosk/KioskIdle.tsx).
import { categories } from "@/data/categories";
import { eventCategories } from "@/data/events";
import { experienceCategories } from "@/data/experiences";
import type { CatalogKind } from "@/lib/catalog/normalize";

export const KIOSK_BASE = "/kiosco";

// Segundos sin tocar la pantalla antes de avisar, y segundos de aviso antes de volver al inicio.
export const KIOSK_IDLE_SECONDS = 90;
export const KIOSK_WARNING_SECONDS = 15;

export type KioskSectionId = "paquetes" | "destinos" | "experiencias" | "eventos";

export type KioskFilter = { value: string; label: string };

export type KioskSection = {
  id: KioskSectionId;
  kind: CatalogKind;
  title: string;
  subtitle: string;
  // Filtros por chips (?filtro=<valor>), del catálogo de categorías de cada tipo.
  filters: KioskFilter[];
  // Parámetro del formulario de cotización para pedir este elemento (`/quote?<param>=<slug>`).
  quoteParam: "package" | "destination" | "experience" | "event";
};

export const kioskSections: KioskSection[] = [
  {
    id: "paquetes",
    kind: "packages",
    title: "Paquetes",
    subtitle: "Viajes armados para cotizar a tu medida",
    filters: categories.map((item) => ({ value: item.slug, label: item.name })),
    quoteParam: "package",
  },
  {
    id: "destinos",
    kind: "destinations",
    title: "Destinos",
    subtitle: "Bolivia y el mundo",
    filters: [
      { value: "nacional", label: "Bolivia" },
      { value: "internacional", label: "Internacionales" },
    ],
    quoteParam: "destination",
  },
  {
    id: "experiencias",
    kind: "experiences",
    title: "Experiencias",
    subtitle: "Excursiones y actividades para sumar a tu viaje",
    filters: experienceCategories.map((item) => ({ value: item.slug, label: item.name })),
    quoteParam: "experience",
  },
  {
    id: "eventos",
    kind: "events",
    title: "Eventos",
    subtitle: "Conciertos, festivales y más",
    filters: eventCategories.map((item) => ({ value: item.slug, label: item.name })),
    quoteParam: "event",
  },
];

export function kioskSection(id: string): KioskSection | undefined {
  return kioskSections.find((section) => section.id === id);
}

export function kioskHref(section?: KioskSectionId, slug?: string, filter?: string): string {
  if (!section) return KIOSK_BASE;
  const base = `${KIOSK_BASE}/${section}${slug ? `/${slug}` : ""}`;
  return filter ? `${base}?filtro=${encodeURIComponent(filter)}` : base;
}
