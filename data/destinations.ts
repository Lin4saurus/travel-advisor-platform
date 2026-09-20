// Datos de demostración editables de destinos (internacionales y nacionales).
// Los textos son descripciones generales del lugar: no incluyen precios, fechas ni temporadas.
export type Destination = {
  slug: string;
  name: string;
  scope: "international" | "national";
  location: string;
  // Frase corta (tarjetas y encabezado) y descripción para la página de detalle.
  summary: string;
  description: string;
  // Slugs de `data/categories.ts`.
  experienceTypes: string[];
  image: string;
  // Fotos de la galería. Son opcionales: si el archivo no existe se muestra el fallback.
  gallery: string[];
  featured: boolean;
};

// /public/images/destinations/<carpeta>/1.jpg … 3.jpg
const gallery = (folder: string) =>
  [1, 2, 3].map((n) => `/images/destinations/${folder}/${n}.jpg`);

export const destinations: Destination[] = [
  // Internacionales
  {
    slug: "cartagena",
    name: "Cartagena",
    scope: "international",
    location: "Colombia",
    summary: "Ciudad amurallada de calles coloniales frente al Caribe.",
    description:
      "Cartagena de Indias, en la costa caribe de Colombia, es famosa por su ciudad amurallada, con calles coloniales, plazas y balcones coloridos. Combina historia, gastronomía y playas cercanas, por lo que es un destino frecuente para escapadas de cultura y descanso.",
    experienceTypes: ["cultura-historia", "playa-resorts"],
    image: "/images/destinations/cartagena.jpg",
    gallery: gallery("cartagena"),
    featured: true,
  },
  {
    slug: "cancun",
    name: "Cancún",
    scope: "international",
    location: "México",
    summary: "Playas de aguas turquesa en el Caribe mexicano.",
    description:
      "Cancún está en la costa del Caribe mexicano, en la península de Yucatán. Es conocida por sus playas de aguas turquesa y su zona de resorts, y sirve de punto de partida para excursiones a sitios arqueológicos y a otras zonas de la región.",
    experienceTypes: ["playa-resorts", "viajes-familiares"],
    image: "/images/destinations/cancun.jpg",
    gallery: gallery("cancun"),
    featured: true,
  },
  {
    slug: "punta-cana",
    name: "Punta Cana",
    scope: "international",
    location: "República Dominicana",
    summary: "Playas de palmeras en el Caribe dominicano.",
    description:
      "Punta Cana, en el extremo este de la República Dominicana, es un destino de playas de arena clara y palmeras, con una amplia oferta de resorts. Suele elegirse para viajes de descanso frente al mar.",
    experienceTypes: ["playa-resorts", "viajes-familiares"],
    image: "/images/destinations/punta-cana.jpg",
    gallery: gallery("punta-cana"),
    featured: true,
  },
  {
    slug: "miami",
    name: "Miami",
    scope: "international",
    location: "Estados Unidos",
    summary: "Playas urbanas, arquitectura art déco y vida nocturna.",
    description:
      "Miami, en Florida (Estados Unidos), combina playas urbanas como South Beach con arquitectura art déco, gastronomía diversa y vida nocturna. Es además un punto de conexión habitual hacia el Caribe y otros destinos.",
    experienceTypes: ["playa-resorts", "grandes-ciudades"],
    image: "/images/destinations/miami.jpg",
    gallery: gallery("miami"),
    featured: true,
  },
  {
    slug: "orlando",
    name: "Orlando",
    scope: "international",
    location: "Estados Unidos",
    summary: "La capital de los parques temáticos en Florida.",
    description:
      "Orlando, en Florida (Estados Unidos), concentra numerosos parques temáticos y atracciones, por lo que es un destino frecuente para viajes en familia.",
    experienceTypes: ["parques-tematicos", "viajes-familiares"],
    image: "/images/destinations/orlando.jpg",
    gallery: gallery("orlando"),
    featured: true,
  },
  {
    slug: "dubai",
    name: "Dubái",
    scope: "international",
    location: "Emiratos Árabes Unidos",
    summary: "Rascacielos y desierto en una misma ciudad.",
    description:
      "Dubái, en los Emiratos Árabes Unidos, es una ciudad de rascacielos, centros comerciales y playas a orillas del golfo Pérsico, rodeada de desierto. Además de la vida urbana, ofrece excursiones por las dunas.",
    experienceTypes: ["grandes-ciudades", "aventura-naturaleza"],
    image: "/images/destinations/dubai.jpg",
    gallery: gallery("dubai"),
    featured: true,
  },
  {
    slug: "estambul",
    name: "Estambul",
    scope: "international",
    location: "Turquía",
    summary: "Ciudad entre dos continentes, con mezquitas históricas y el Bósforo.",
    description:
      "Estambul, en Turquía, se extiende entre Europa y Asia a ambos lados del estrecho del Bósforo. Su casco histórico reúne mezquitas, palacios y bazares de distintas épocas.",
    experienceTypes: ["cultura-historia", "grandes-ciudades"],
    image: "/images/destinations/estambul.jpg",
    gallery: gallery("estambul"),
    featured: true,
  },
  {
    slug: "rio-de-janeiro",
    name: "Río de Janeiro",
    scope: "international",
    location: "Brasil",
    summary: "Playas, montañas y el Cristo Redentor.",
    description:
      "Río de Janeiro, en Brasil, une playas como Copacabana e Ipanema con montañas que se elevan dentro de la ciudad, como el Pan de Azúcar y el Corcovado, donde está el Cristo Redentor.",
    experienceTypes: ["playa-resorts", "grandes-ciudades"],
    image: "/images/destinations/rio-de-janeiro.jpg",
    gallery: gallery("rio-de-janeiro"),
    featured: true,
  },

  // Nacionales (Bolivia)
  {
    slug: "uyuni",
    name: "Uyuni",
    scope: "national",
    location: "Bolivia",
    summary: "El mayor salar del mundo, en el altiplano boliviano.",
    description:
      "El Salar de Uyuni, en el altiplano del suroeste de Bolivia, es el salar continuo más grande del mundo. Suele recorrerse en excursiones de uno o más días.",
    experienceTypes: ["aventura-naturaleza", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/uyuni.jpg",
    gallery: gallery("bolivia/uyuni"),
    featured: false,
  },
  {
    slug: "chiquitania",
    name: "Chiquitania",
    scope: "national",
    location: "Bolivia",
    summary: "Región de misiones jesuíticas y paisajes de bosque seco.",
    description:
      "La Chiquitania, en el departamento de Santa Cruz, es una región de bosque seco y serranías conocida por sus misiones jesuíticas, declaradas Patrimonio de la Humanidad por la UNESCO.",
    experienceTypes: ["cultura-historia", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/chiquitania.jpg",
    gallery: gallery("bolivia/chiquitania"),
    featured: false,
  },
  {
    slug: "titicaca",
    name: "Lago Titicaca",
    scope: "national",
    location: "Bolivia",
    summary: "Lago de altura compartido con Perú, con la Isla del Sol.",
    description:
      "El lago Titicaca, en el altiplano entre Bolivia y Perú, es uno de los lagos navegables más altos del mundo. Del lado boliviano destacan la Isla del Sol y la Isla de la Luna, con antiguos sitios ligados a la cultura andina.",
    experienceTypes: ["aventura-naturaleza", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/titicaca.jpg",
    gallery: gallery("bolivia/titicaca"),
    featured: false,
  },
  {
    slug: "rurrenabaque",
    name: "Rurrenabaque",
    scope: "national",
    location: "Bolivia",
    summary: "Puerta de entrada a la Amazonía boliviana.",
    description:
      "Rurrenabaque, a orillas del río Beni, en el departamento de Beni, es punto de partida habitual para excursiones a la selva amazónica y a las pampas del Yacuma.",
    experienceTypes: ["aventura-naturaleza", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/rurrenabaque.jpg",
    gallery: gallery("bolivia/rurrenabaque"),
    featured: false,
  },
  {
    slug: "samaipata",
    name: "Samaipata",
    scope: "national",
    location: "Bolivia",
    summary: "Pueblo de valles con el sitio arqueológico de El Fuerte.",
    description:
      "Samaipata, en los valles del departamento de Santa Cruz, es un pueblo tranquilo cercano al sitio arqueológico de El Fuerte, declarado Patrimonio de la Humanidad, y a zonas de naturaleza y senderismo.",
    experienceTypes: ["cultura-historia", "aventura-naturaleza", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/samaipata.jpg",
    gallery: gallery("bolivia/samaipata"),
    featured: false,
  },
  {
    slug: "madidi",
    name: "Parque Madidi",
    scope: "national",
    location: "Bolivia",
    summary: "Parque nacional de selva amazónica y gran biodiversidad.",
    description:
      "El Parque Nacional Madidi, al norte del departamento de La Paz, abarca desde zonas andinas hasta selva amazónica y es reconocido por su biodiversidad.",
    experienceTypes: ["aventura-naturaleza", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/madidi.jpg",
    gallery: gallery("bolivia/madidi"),
    featured: false,
  },
  {
    slug: "tarija",
    name: "Tarija",
    scope: "national",
    location: "Bolivia",
    summary: "Valles y viñedos del sur de Bolivia.",
    description:
      "Tarija, en el sur de Bolivia, es conocida por sus valles y viñedos, y por su producción de vino y singani.",
    experienceTypes: ["escapadas-nacionales"],
    image: "/images/destinations/bolivia/tarija.jpg",
    gallery: gallery("bolivia/tarija"),
    featured: false,
  },
  {
    slug: "sucre",
    name: "Sucre",
    scope: "national",
    location: "Bolivia",
    summary: "La ciudad blanca, de arquitectura colonial.",
    description:
      "Sucre es la capital constitucional de Bolivia. Su centro histórico, de arquitectura colonial y edificios blancos, fue declarado Patrimonio de la Humanidad por la UNESCO.",
    experienceTypes: ["cultura-historia", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/sucre.jpg",
    gallery: gallery("bolivia/sucre"),
    featured: false,
  },
  {
    slug: "potosi",
    name: "Potosí",
    scope: "national",
    location: "Bolivia",
    summary: "Ciudad colonial al pie del Cerro Rico.",
    description:
      "Potosí, al pie del Cerro Rico, fue una de las ciudades más importantes de la época colonial por su minería de plata. Su centro histórico es Patrimonio de la Humanidad de la UNESCO.",
    experienceTypes: ["cultura-historia", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/potosi.jpg",
    gallery: gallery("bolivia/potosi"),
    featured: false,
  },
  {
    slug: "santa-cruz",
    name: "Santa Cruz de la Sierra",
    scope: "national",
    location: "Bolivia",
    summary: "Ciudad grande y moderna del oriente boliviano.",
    description:
      "Santa Cruz de la Sierra es la ciudad más poblada de Bolivia y un punto de entrada a la Chiquitania, a los valles cruceños y a otras zonas del oriente del país.",
    experienceTypes: ["grandes-ciudades", "escapadas-nacionales"],
    image: "/images/destinations/bolivia/santa-cruz.jpg",
    gallery: gallery("bolivia/santa-cruz"),
    featured: false,
  },
];
