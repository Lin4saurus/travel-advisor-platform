// Datos de demostración editables de paquetes.
// Todo dato sin confirmar va como `null` o lista vacía (precio, duración, temporada, régimen, disponibilidad,
// salida, popularidad, qué incluye, itinerario, opcionales, preguntas): la UI muestra "Consultar precio",
// "Duración a consultar", etc. y el catálogo solo ofrece filtros y ordenamientos para los que hay datos
// (ver `lib/packages.ts`). Los textos genéricos (costos que normalmente no se incluyen, recomendaciones,
// preguntas frecuentes) están en `config/packages.ts`.
export type PackageAvailability = "available" | "limited" | "consult";

export type ItineraryDay = { title: string; description: string };
export type FaqItem = { question: string; answer: string };

export type TravelPackage = {
  slug: string;
  name: string;
  destination: string;
  // Slug de `data/destinations.ts` para enlazar y mostrar "Sobre el destino" (null = sin destino propio).
  destinationSlug: string | null;
  // Agrupación comercial editable (filtro "Región").
  region: string;
  // Slugs de `data/categories.ts` (filtro "Tipo de viaje").
  types: string[];
  summary: string;
  // Descripción de la página de detalle.
  description: string;
  image: string;
  // Fotos secundarias de la galería (opcionales: si el archivo no existe se muestra el fallback).
  gallery: string[];
  durationDays: number | null;
  price: { amount: number; currency: string } | null;
  season: string | null;
  // Régimen de comidas / alojamiento, p. ej. "Todo incluido".
  board: string | null;
  // `null` = sin confirmar (no se afirma ni se niega).
  includes: {
    flights: boolean | null;
    transfers: boolean | null;
    excursions: boolean | null;
  };
  // Otros servicios confirmados como incluidos / no incluidos, en texto libre.
  included: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  optionals: string[];
  // Preguntas propias del paquete (se muestran antes de las generales de `config/packages.ts`).
  faq: FaqItem[];
  availability: PackageAvailability | null;
  // Etiqueta (filtro "Etiqueta"), p. ej. "Oferta".
  badge: string | null;
  // Orden "Destacados".
  featured: boolean;
  // Orden "Más populares" (mayor = más popular).
  popularity: number | null;
  // Orden "Salida más próxima" (AAAA-MM-DD).
  nextDeparture: string | null;
};

const unknownIncludes = { flights: null, transfers: null, excursions: null };

// /public/images/packages/<slug>/1.jpg … 4.jpg (la principal es `main.jpg`)
const gallery = (slug: string) =>
  [1, 2, 3, 4].map((n) => `/images/packages/${slug}/${n}.jpg`);

export const packages: TravelPackage[] = [
  {
    slug: "cartagena-caribe",
    name: "Cartagena y el Caribe",
    destination: "Cartagena, Colombia",
    destinationSlug: "cartagena",
    region: "Caribe",
    types: ["cultura-historia", "playa-resorts"],
    summary: "Ciudad amurallada, historia colonial y playas del Caribe colombiano.",
    description:
      "Un viaje para conocer Cartagena de Indias: su ciudad amurallada, su historia colonial y las playas del Caribe colombiano.",
    image: "/images/packages/cartagena-caribe/main.jpg",
    gallery: gallery("cartagena-caribe"),
    durationDays: null,
    price: null,
    season: null,
    board: null,
    includes: unknownIncludes,
    included: [],
    excluded: [],
    itinerary: [],
    optionals: [],
    faq: [],
    availability: null,
    badge: null,
    featured: false,
    popularity: null,
    nextDeparture: null,
  },
  {
    slug: "orlando-parques",
    name: "Orlando y sus parques",
    destination: "Orlando, Estados Unidos",
    destinationSlug: "orlando",
    region: "Norteamérica",
    types: ["parques-tematicos", "viajes-familiares"],
    summary: "Parques temáticos y diversión para toda la familia.",
    description:
      "Un viaje a Orlando, en Florida, la ciudad de los parques temáticos, pensado para disfrutar en familia.",
    image: "/images/packages/orlando-parques/main.jpg",
    gallery: gallery("orlando-parques"),
    durationDays: null,
    price: null,
    season: null,
    board: null,
    includes: unknownIncludes,
    included: [],
    excluded: [],
    itinerary: [],
    optionals: [],
    faq: [],
    availability: null,
    badge: null,
    featured: false,
    popularity: null,
    nextDeparture: null,
  },
  {
    slug: "punta-cana-todo-incluido",
    name: "Punta Cana todo incluido",
    destination: "Punta Cana, República Dominicana",
    destinationSlug: "punta-cana",
    region: "Caribe",
    types: ["playa-resorts", "viajes-familiares"],
    summary: "Descanso frente al mar en el Caribe dominicano.",
    description:
      "Descanso frente al mar en Punta Cana, en el Caribe dominicano, con régimen todo incluido.",
    image: "/images/packages/punta-cana-todo-incluido/main.jpg",
    gallery: gallery("punta-cana-todo-incluido"),
    durationDays: null,
    price: null,
    season: null,
    board: "Todo incluido",
    includes: unknownIncludes,
    included: [],
    excluded: [],
    itinerary: [],
    optionals: [],
    faq: [],
    availability: null,
    badge: null,
    featured: true,
    popularity: null,
    nextDeparture: null,
  },
  {
    slug: "salar-de-uyuni",
    name: "Salar de Uyuni",
    destination: "Uyuni, Bolivia",
    destinationSlug: "uyuni",
    region: "Bolivia",
    types: ["aventura-naturaleza", "escapadas-nacionales"],
    summary: "Paisajes de sal y altiplano en el corazón de Bolivia.",
    description:
      "Una excursión al Salar de Uyuni, el salar continuo más grande del mundo, en el altiplano boliviano.",
    image: "/images/packages/salar-de-uyuni/main.jpg",
    gallery: gallery("salar-de-uyuni"),
    durationDays: null,
    price: null,
    season: null,
    board: null,
    includes: unknownIncludes,
    included: [],
    excluded: [],
    itinerary: [],
    optionals: [],
    faq: [],
    availability: null,
    badge: null,
    featured: true,
    popularity: null,
    nextDeparture: null,
  },
  {
    slug: "rio-de-janeiro",
    name: "Río de Janeiro",
    destination: "Río de Janeiro, Brasil",
    destinationSlug: "rio-de-janeiro",
    region: "Sudamérica",
    types: ["playa-resorts", "grandes-ciudades"],
    summary: "Playas, montañas y los íconos de la Ciudad Maravillosa.",
    description:
      "Un viaje a Río de Janeiro para conocer sus playas, sus montañas y sus íconos, como el Cristo Redentor y el Pan de Azúcar.",
    image: "/images/packages/rio-de-janeiro/main.jpg",
    gallery: gallery("rio-de-janeiro"),
    durationDays: null,
    price: null,
    season: null,
    board: null,
    includes: unknownIncludes,
    included: [],
    excluded: [],
    itinerary: [],
    optionals: [],
    faq: [],
    availability: null,
    badge: null,
    featured: false,
    popularity: null,
    nextDeparture: null,
  },
  {
    slug: "dubai-ciudad-del-futuro",
    name: "Dubái, ciudad del futuro",
    destination: "Dubái, Emiratos Árabes Unidos",
    destinationSlug: "dubai",
    region: "Medio Oriente",
    types: ["grandes-ciudades", "aventura-naturaleza"],
    summary: "Rascacielos, desierto y una ciudad que no deja de crecer.",
    description:
      "Un viaje a Dubái, entre rascacielos y desierto, para conocer su arquitectura moderna y su entorno desértico.",
    image: "/images/packages/dubai-ciudad-del-futuro/main.jpg",
    gallery: gallery("dubai-ciudad-del-futuro"),
    durationDays: null,
    price: null,
    season: null,
    board: null,
    includes: unknownIncludes,
    included: [],
    excluded: [],
    itinerary: [],
    optionals: [],
    faq: [],
    availability: null,
    badge: null,
    featured: true,
    popularity: null,
    nextDeparture: null,
  },
];
