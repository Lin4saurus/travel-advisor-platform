// Ejemplos ficticios y editables de eventos. NO representan artistas, fechas ni entradas confirmadas.
// Los campos de detalle y la carga real llegan en M7.
export type TravelEvent = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  image: string;
  city: string | null;
  status: string;
};

export const events: TravelEvent[] = [
  { slug: "concierto-internacional", name: "Concierto internacional", category: "Conciertos", summary: "Ejemplo ilustrativo: consulta por artistas, fechas y entradas disponibles.", image: "/images/events/concierto-internacional.jpg", city: null, status: "Fechas por confirmar" },
  { slug: "festival-musica", name: "Festival de música", category: "Festivales", summary: "Ejemplo ilustrativo: consulta por festivales y programación.", image: "/images/events/festival-musica.jpg", city: null, status: "Fechas por confirmar" },
  { slug: "parque-tematico", name: "Día en un parque temático", category: "Parques", summary: "Ejemplo ilustrativo: consulta por parques y entradas.", image: "/images/events/parque-tematico.jpg", city: null, status: "Fechas por confirmar" },
];
