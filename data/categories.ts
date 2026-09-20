// Categorías de viaje. `slug` es el valor del filtro `type` en `/packages?type=<slug>` (se filtra en M4).
export type TravelCategory = {
  slug: string;
  name: string;
  image: string;
};

export const categories: TravelCategory[] = [
  { slug: "playa-resorts", name: "Playa y resorts", image: "/images/categories/playa-resorts.jpg" },
  { slug: "grandes-ciudades", name: "Grandes ciudades", image: "/images/categories/grandes-ciudades.jpg" },
  { slug: "aventura-naturaleza", name: "Aventura y naturaleza", image: "/images/categories/aventura-naturaleza.jpg" },
  { slug: "cultura-historia", name: "Cultura e historia", image: "/images/categories/cultura-historia.jpg" },
  { slug: "parques-tematicos", name: "Parques temáticos", image: "/images/categories/parques-tematicos.jpg" },
  { slug: "eventos-conciertos", name: "Eventos y conciertos", image: "/images/categories/eventos-conciertos.jpg" },
  { slug: "viajes-familiares", name: "Viajes familiares", image: "/images/categories/viajes-familiares.jpg" },
  { slug: "escapadas-nacionales", name: "Escapadas nacionales", image: "/images/categories/escapadas-nacionales.jpg" },
];
