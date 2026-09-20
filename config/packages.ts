// Textos editables del catálogo de paquetes (orden, disponibilidad, "incluye") y contenido general de la
// página de detalle. Los textos generales están redactados en términos neutros: no prometen plazos,
// precios ni penalidades. Las políticas reales se definen en M11.
import type { FaqItem, PackageAvailability } from "@/data/packages";

export type SortKey =
  | "relevance"
  | "featured"
  | "price_asc"
  | "price_desc"
  | "duration_asc"
  | "duration_desc"
  | "popular"
  | "departure";

export const sortLabels: Record<SortKey, string> = {
  relevance: "Relevancia",
  featured: "Destacados",
  price_asc: "Precio: de menor a mayor",
  price_desc: "Precio: de mayor a menor",
  duration_asc: "Duración: de menor a mayor",
  duration_desc: "Duración: de mayor a menor",
  popular: "Más populares",
  departure: "Salida más próxima",
};

export const availabilityLabels: Record<PackageAvailability, string> = {
  available: "Disponible",
  limited: "Cupos limitados",
  consult: "A consultar",
};

export const includeLabels = {
  flights: "Vuelos",
  transfers: "Traslados",
  excursions: "Excursiones",
} as const;

// --- Detalle de paquete: contenido general ---------------------------------------------------------

// Costos que normalmente no están incluidos en un paquete de viaje (se muestran bajo "Qué NO incluye").
export const defaultExclusions = [
  "Gastos personales y compras.",
  "Propinas.",
  "Seguro de viaje o de asistencia al viajero (recomendado).",
  "Impuestos y tasas de salida, de ingreso o turísticas del destino, si corresponden.",
  "Alimentos y bebidas que no estén especificados en el paquete.",
  "Excursiones y actividades opcionales.",
  "Visas y trámites migratorios, si corresponden.",
  "Equipaje adicional y selección de asientos en los vuelos, si corresponden.",
  "Cambios o cancelaciones: pueden generar penalidades según las condiciones del servicio.",
];

export const recommendations = [
  "Verifica que tu pasaporte o documento de viaje esté vigente y cumpla los requisitos del destino.",
  "Consulta con anticipación si necesitas visa, vacunas u otros requisitos de ingreso.",
  "Contrata un seguro de viaje o de asistencia al viajero.",
  "Reserva con tiempo, sobre todo si viajas en temporadas de mucha demanda.",
  "Revisa el clima y la temporada del destino para preparar tu equipaje.",
  "Lleva copias de tus documentos y de tus reservas.",
];

export const importantInfo = [
  "Los precios, las fechas y la disponibilidad son referenciales y se confirman en tu cotización.",
  "Cuando un precio o una fecha no está publicado, se indica «Consultar».",
  "El detalle de lo incluido y de lo no incluido se precisa en la cotización.",
  "Las imágenes son ilustrativas.",
];

export const conditions = [
  "Las condiciones de pago, cambios y cancelaciones varían según el paquete y los proveedores.",
  "Consulta las condiciones específicas antes de confirmar tu reserva.",
];

export const defaultFaq: FaqItem[] = [
  {
    question: "¿Cómo pido una cotización?",
    answer:
      "Usa el botón «Cotizar este paquete» o el formulario de cotización. Cuéntanos tus fechas, cuántas personas viajan y tus preferencias.",
  },
  {
    question: "¿Los precios y las fechas son definitivos?",
    answer:
      "No. Son referenciales y se confirman en la cotización. Cuando no hay un precio o una fecha publicados, se indica «Consultar».",
  },
  {
    question: "¿Puedo modificar el paquete?",
    answer:
      "Puedes solicitar una opción personalizada con otras fechas, otros servicios o actividades adicionales; su viabilidad se confirma en la cotización.",
  },
  {
    question: "¿Qué documentos necesito para viajar?",
    answer:
      "Depende del destino y de tu nacionalidad. Verifica los requisitos de ingreso en fuentes oficiales y consúltanos si tienes dudas.",
  },
  {
    question: "¿Qué incluye el paquete?",
    answer:
      "Lo incluido y lo no incluido se muestra en esta página cuando está confirmado, y se precisa en la cotización.",
  },
];
