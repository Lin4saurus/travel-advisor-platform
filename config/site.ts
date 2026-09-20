// Configuración editable del sitio: marca, navegación, contacto y redes.
// Los datos sin confirmar van como `null` (o listas vacías) y la UI simplemente no los muestra.

export type NavLink = {
  label: string;
  href: string;
};

type SiteConfig = {
  name: string;
  tagline: string;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
    hours: string | null;
  };
  // Cada red: { label: "Instagram", href: "https://…" }. Vacío = no se muestra la sección.
  social: NavLink[];
};

export const siteConfig: SiteConfig = {
  name: "Mundo Viajero",
  tagline: "Asesoría, cotización y venta de viajes a tu medida.",
  contact: {
    email: null,
    phone: null,
    address: null,
    hours: null,
  },
  social: [],
};

export const mainNav: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Destinos", href: "/destinations" },
  { label: "Paquetes", href: "/packages" },
  { label: "Experiencias", href: "/experiences" },
  { label: "Eventos", href: "/events" },
  { label: "Sobre nosotros", href: "/about" },
  { label: "Contacto", href: "/contact" },
];

export const quoteCta = {
  label: "Cotizar mi viaje",
  // Versión corta para pantallas de menos de 390px (el nombre accesible sigue siendo `label`).
  shortLabel: "Cotizar",
  href: "/quote",
};

export const footerNav: { explore: NavLink[]; help: NavLink[] } = {
  explore: [
    { label: "Destinos", href: "/destinations" },
    { label: "Paquetes", href: "/packages" },
    { label: "Experiencias", href: "/experiences" },
    { label: "Eventos", href: "/events" },
    { label: "Sobre nosotros", href: "/about" },
  ],
  help: [
    { label: "Cotizar mi viaje", href: "/quote" },
    { label: "Información de reservas", href: "/booking-info" },
    { label: "Términos y condiciones", href: "/terms" },
    { label: "Política de privacidad", href: "/privacy" },
  ],
};
