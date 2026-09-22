// Textos editables del catálogo de eventos.
import type { EventStatus } from "@/data/events";

export const eventStatusLabels: Record<EventStatus, string> = {
  "por-confirmar": "Fechas por confirmar",
  consultar: "Consultar disponibilidad",
  confirmado: "Confirmado",
  agotado: "Agotado",
};
