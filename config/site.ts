// Configuración editable del sitio: marca, navegación, contacto y redes.
// Los datos sin confirmar van como `null` (o listas vacías) y la UI simplemente no los muestra.

export type NavLink = {
  label: string;
  href: string;
};

export type Branch = {
  name: string;
  address: string;
  // Teléfonos tal como se muestran + su forma para `tel:` (internacional, solo dígitos y "+").
  phones: { label: string; href: string }[];
  hours: string[];
};

type SiteConfig = {
  name: string;
  tagline: string;
  contact: {
    email: string | null;
    // Canal para cambios/modificaciones de una solicitud ya enviada (M11, `/booking-info`). Si no se define,
    // esas páginas caen de vuelta a `contact.email` y, si tampoco hay, remiten a `/contact`.
    reservationsEmail: string | null;
    phone: string | null;
    // Forma para `tel:` del teléfono principal (p. ej. "+59133449777").
    phoneHref: string | null;
    // Número de WhatsApp en formato internacional sin "+" ni espacios, para `https://wa.me/<número>`.
    whatsapp: string | null;
    // Cómo se muestra ese número.
    whatsappLabel: string | null;
    address: string | null;
    hours: string | null;
  };
  // Oficinas con su dirección, teléfonos y horario (se muestran en /contact).
  branches: Branch[];
  // Cada red: { label: "Instagram", href: "https://…" }. Vacío = no se muestra la sección.
  social: NavLink[];
};

// Datos reales de Universal Tours tomados de universaltours.com.bo (pie de página y "Sucursales", revisados el
// 2026-11-20). Ojo: la barra superior de ese sitio muestra "(591) 3 334-9777" y el pie y la página de sucursales
// "(591-3) 344-9777"; se usó este último (aparece en dos lugares). Confirmar con la empresa.
export const siteConfig: SiteConfig = {
  name: "Universal Tours",
  tagline: "Agencia de viajes boliviana desde 1975: vuelos, hoteles, paquetes y asesoría para viajar por Bolivia y el mundo.",
  contact: {
    email: "universal@universaltours.com.bo",
    reservationsEmail: null,
    phone: "(591-3) 344-9777",
    phoneHref: "+59133449777",
    whatsapp: "59177332206",
    whatsappLabel: "+591 773-32206",
    address: "Calle Dr. Alberto Seleme Antelo No. 35 (Calle H), Equipetrol Norte, Santa Cruz de la Sierra",
    hours: "Lunes a viernes de 09:00 a 18:00 · Sábados de 09:00 a 13:00",
  },
  branches: [
    {
      name: "Oficina central (Equipetrol)",
      address: "Calle Dr. Alberto Seleme Antelo No. 35 (Calle H), Equipetrol Norte, Santa Cruz de la Sierra",
      phones: [
        { label: "(591-3) 344-9777", href: "+59133449777" },
        { label: "773-60004", href: "+59177360004" },
        { label: "WhatsApp 773-32206", href: "https://wa.me/59177332206" },
      ],
      hours: ["Lunes a viernes de 09:00 a 18:00", "Sábados de 09:00 a 13:00"],
    },
    {
      name: "Sucursal Ventura Mall",
      address: "Ventura Mall, nivel 2, local 14, Santa Cruz de la Sierra",
      phones: [
        { label: "(591-3) 402-3059", href: "+59134023059" },
        { label: "750-15509", href: "+59175015509" },
      ],
      hours: ["Lunes a sábado de 10:00 a 20:00", "Domingos de 11:00 a 19:00"],
    },
  ],
  social: [
    { label: "Facebook", href: "https://www.facebook.com/UniversalToursLtda/" },
    { label: "Instagram", href: "https://www.instagram.com/universaltoursbolivia/" },
    { label: "TikTok", href: "https://www.tiktok.com/@universal_tours" },
    { label: "YouTube", href: "https://www.youtube.com/@UniversalToursBolivia" },
  ],
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
