// Ejemplos ficticios y editables de eventos. NO representan artistas, fechas ni entradas confirmadas:
// `isExample: true` los marca en la UI como "Ejemplo ilustrativo". Todo dato sin confirmar va como `null` o
// lista vacía (ciudad, fecha, duración, qué incluye); la UI muestra "Ciudad a consultar", "Fecha por confirmar",
// etc. Las categorías cubren las 6 que pide M7; las que aún no tienen eventos se muestran deshabilitadas.
export type EventCategory = {
  slug: string;
  name: string;
};

export const eventCategories: EventCategory[] = [
  { slug: "conciertos", name: "Conciertos" },
  { slug: "deportivos", name: "Deportivos" },
  { slug: "ferias", name: "Ferias" },
  { slug: "festivales", name: "Festivales" },
  { slug: "parques", name: "Parques" },
  { slug: "especiales", name: "Especiales" },
];

// Estado editable (los textos están en `config/events.ts`). Solo usar "confirmado" con datos verificados.
export type EventStatus = "por-confirmar" | "consultar" | "confirmado" | "agotado";

export type TravelEvent = {
  slug: string;
  name: string;
  // Slug de `eventCategories`.
  category: string;
  summary: string;
  image: string;
  city: string | null;
  // AAAA-MM-DD (null = sin confirmar).
  date: string | null;
  // Texto libre, p. ej. "4 horas" (null = sin confirmar).
  duration: string | null;
  // Servicios confirmados como incluidos, en texto libre.
  includes: string[];
  status: EventStatus;
  // true = ejemplo ilustrativo, no un evento real.
  isExample: boolean;
};

export const events: TravelEvent[] = [
  {
    slug: "concierto-internacional",
    name: "Concierto internacional",
    category: "conciertos",
    summary: "Un concierto internacional para vivir la música en vivo. Consulta por artistas, fechas y entradas.",
    image: "/images/events/concierto-internacional.jpg",
    city: null,
    date: null,
    duration: null,
    includes: [],
    status: "por-confirmar",
    isExample: true,
  },
  {
    slug: "festival-musica",
    name: "Festival de música",
    category: "festivales",
    summary: "Un festival de música al aire libre. Consulta por la programación y las fechas.",
    image: "/images/events/festival-musica.jpg",
    city: null,
    date: null,
    duration: null,
    includes: [],
    status: "por-confirmar",
    isExample: true,
  },
  {
    slug: "parque-tematico",
    name: "Día en un parque temático",
    category: "parques",
    summary: "Un día en un parque temático. Consulta por parques y entradas.",
    image: "/images/events/parque-tematico.jpg",
    city: null,
    date: null,
    duration: null,
    includes: [],
    status: "por-confirmar",
    isExample: true,
  },
];
