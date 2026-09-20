// Datos de demostración editables de experiencias y excursiones.
// Todo dato sin confirmar va como `null` o lista vacía (ciudad, duración, disponibilidad, qué incluye): la UI
// muestra "Ciudad a consultar", "Duración a consultar", etc. Las categorías cubren las 10 que pide M6; las
// que aún no tienen experiencias se muestran deshabilitadas en `/experiences`.
import type { PackageAvailability } from "@/data/packages";

export type ExperienceCategory = {
  slug: string;
  name: string;
};

export const experienceCategories: ExperienceCategory[] = [
  { slug: "visitas-guiadas", name: "Visitas guiadas" },
  { slug: "museos", name: "Museos" },
  { slug: "paseos-en-barco", name: "Paseos en barco" },
  { slug: "naturaleza", name: "Naturaleza" },
  { slug: "parques", name: "Parques" },
  { slug: "gastronomia", name: "Gastronomía" },
  { slug: "aventura", name: "Aventura" },
  { slug: "familiar", name: "Familiar" },
  { slug: "nocturna", name: "Nocturna" },
  { slug: "religiosa", name: "Religiosa" },
];

export type Experience = {
  slug: string;
  name: string;
  summary: string;
  // Descripción de la página de detalle.
  description: string;
  image: string;
  // Slugs de `experienceCategories`.
  categories: string[];
  // Ciudad o lugar (null = sin confirmar).
  location: string | null;
  // Texto libre, p. ej. "3 horas" (null = sin confirmar).
  duration: string | null;
  availability: PackageAvailability | null;
  // Servicios confirmados como incluidos, en texto libre.
  includes: string[];
  featured: boolean;
};

export const experiences: Experience[] = [
  {
    slug: "visita-guiada",
    name: "Visita guiada",
    summary: "Recorridos con guía para conocer la historia y la cultura de la ciudad.",
    description:
      "Recorridos con guía para conocer la historia y la cultura de la ciudad, con el contexto de sus lugares más representativos.",
    image: "/images/experiences/visita-guiada.jpg",
    categories: ["visitas-guiadas"],
    location: null,
    duration: null,
    availability: null,
    includes: [],
    featured: true,
  },
  {
    slug: "tour-estadio",
    name: "Tour por estadios",
    summary: "Conoce por dentro estadios y escenarios deportivos.",
    description: "Una visita para conocer estadios y escenarios deportivos por dentro.",
    image: "/images/experiences/tour-estadio.jpg",
    categories: ["visitas-guiadas"],
    location: null,
    duration: null,
    availability: null,
    includes: [],
    featured: false,
  },
  {
    slug: "paseo-gondola",
    name: "Paseo en góndola",
    summary: "Un recorrido tranquilo por los canales de la ciudad.",
    description: "Un recorrido tranquilo por los canales de la ciudad a bordo de una góndola.",
    image: "/images/experiences/paseo-gondola.jpg",
    categories: ["paseos-en-barco"],
    location: null,
    duration: null,
    availability: null,
    includes: [],
    featured: false,
  },
  {
    slug: "visita-museo",
    name: "Visita a museos",
    summary: "Galerías y museos para descubrir arte e historia.",
    description: "Una visita a museos y galerías para descubrir arte e historia.",
    image: "/images/experiences/visita-museo.jpg",
    categories: ["museos"],
    location: null,
    duration: null,
    availability: null,
    includes: [],
    featured: false,
  },
  {
    slug: "paseo-barco",
    name: "Paseo en barco",
    summary: "Navega por ríos y bahías con vistas de la ciudad.",
    description: "Un paseo en barco por ríos o bahías para ver la ciudad desde el agua.",
    image: "/images/experiences/paseo-barco.jpg",
    categories: ["paseos-en-barco"],
    location: null,
    duration: null,
    availability: null,
    includes: [],
    featured: true,
  },
  {
    slug: "excursion-isla",
    name: "Excursión a islas",
    summary: "Navegación y playa en islas cercanas.",
    description: "Una excursión para navegar hacia islas cercanas y disfrutar del mar y la playa.",
    image: "/images/experiences/excursion-isla.jpg",
    categories: ["paseos-en-barco", "naturaleza"],
    location: null,
    duration: null,
    availability: null,
    includes: [],
    featured: true,
  },
  {
    slug: "chiva-rumbera",
    name: "Chiva rumbera",
    summary: "Recorrido nocturno de música y fiesta en un bus típico colombiano.",
    description:
      "Un recorrido nocturno con música y fiesta en una chiva, el bus típico colombiano.",
    image: "/images/experiences/chiva-rumbera.jpg",
    categories: ["nocturna"],
    location: null,
    duration: null,
    availability: null,
    includes: [],
    featured: true,
  },
];
