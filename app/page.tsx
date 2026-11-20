import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import DestinationCard from "@/components/DestinationCard";
import EventCard from "@/components/EventCard";
import ExperienceCard from "@/components/ExperienceCard";
import NewsletterForm from "@/components/NewsletterForm";
import PackageCard from "@/components/PackageCard";
import Section from "@/components/Section";
import Hero from "@/components/home/Hero";
import TripSearchForm from "@/components/home/TripSearchForm";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";
import { categories } from "@/data/categories";
import { getCatalog } from "@/lib/catalog/read";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Universal Tours | Asesoría, cotización y venta de viajes",
  description:
    "Asesoría personalizada, cotización y venta de viajes: destinos, paquetes, experiencias y eventos, en Bolivia y el mundo.",
  path: "/",
  absoluteTitle: true,
});

// El catálogo vive en Supabase (M12): la página estática se regenera como mucho cada 5 minutos, y antes si el
// panel guarda un cambio (invalida la etiqueta del catálogo).
export const revalidate = 300;

// Beneficios reales de Universal Tours (universaltours.com.bo, revisado el 2026-11-20), redactados aquí.
const benefits = [
  {
    title: "Desde 1975",
    text: "Una agencia boliviana con décadas de experiencia organizando viajes, con certificación IATA.",
  },
  {
    title: "Asesores de verdad",
    text: "Te atienden personas en Bolivia, en nuestras oficinas, por teléfono o por WhatsApp.",
  },
  {
    title: "Pago en cuotas",
    text: "Puedes financiar tu viaje en cuotas sin intereses; tu asesor te explica las condiciones.",
  },
  {
    title: "Hertz y Dollar en Bolivia",
    text: "Somos representantes exclusivos: suma el alquiler de auto a tu viaje.",
  },
];

const gridClass = "grid gap-6 sm:grid-cols-2";

function pickFeatured<T extends { featured: boolean }>(items: T[], limit: number): T[] {
  const featured = items.filter((item) => item.featured);
  return (featured.length > 0 ? featured : items).slice(0, limit);
}

export default async function Home() {
  const catalog = await getCatalog();
  const { destinations } = catalog;
  // Muestras acotadas: con el catálogo editable desde el panel (M12) las listas pueden crecer. Si nada está
  // marcado como destacado, se muestran los primeros; una sección sin elementos no se pinta (M13).
  const internationalDestinations = pickFeatured(
    destinations.filter((destination) => destination.scope === "international"),
    8,
  );
  const nationalDestinations = destinations.filter((destination) => destination.scope === "national").slice(0, 10);
  const packages = pickFeatured(catalog.packages, 6);
  const featuredExperiences = pickFeatured(catalog.experiences, 4);
  const events = catalog.events.slice(0, 3);

  return (
    <main className="flex-1">
      <Hero />
      <TripSearchForm destinationNames={destinations.map((destination) => destination.name)} />

      <Section
        id="categorias"
        title="Elige tu tipo de viaje"
        description="Explora paquetes según lo que más te entusiasma."
      >
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      </Section>

      {internationalDestinations.length > 0 && (
        <Section
          id="destinos"
          title="Destinos destacados"
          description="Lugares del mundo para inspirar tu próxima escapada."
          action={{ label: "Ver todos los destinos", href: "/destinations" }}
          tone="surface"
        >
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {internationalDestinations.map((destination) => (
              <li key={destination.slug}>
                <DestinationCard destination={destination} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {packages.length > 0 && (
        <Section
          id="paquetes"
          title="Paquetes recomendados"
          description="Ejemplos de paquetes. Escríbenos y los ajustamos a tus fechas y a tu presupuesto."
          action={{ label: "Ver todos los paquetes", href: "/packages" }}
        >
          <ul className={`${gridClass} lg:grid-cols-3`}>
            {packages.map((pkg) => (
              <li key={pkg.slug}>
                <PackageCard pkg={pkg} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {featuredExperiences.length > 0 && (
        <Section
          id="experiencias"
          title="Experiencias y excursiones"
          description="Suma actividades a tu viaje: paseos, visitas guiadas y más."
          action={{ label: "Ver todas las experiencias", href: "/experiences" }}
          tone="surface"
        >
          <ul className={`${gridClass} lg:grid-cols-4`}>
            {featuredExperiences.map((experience) => (
              <li key={experience.slug}>
                <ExperienceCard experience={experience} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        id="beneficios"
        title="¿Por qué reservar con Universal Tours?"
        description="Te acompañamos desde la idea hasta la cotización."
      >
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-2xl border border-travel-border bg-travel-background p-5"
            >
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-travel-accent-light text-travel-primary-dark"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h3 className="mt-4 font-semibold text-travel-primary-dark">{benefit.title}</h3>
              <p className="mt-2 text-sm text-travel-muted">{benefit.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {events.length > 0 && (
        <Section
          id="eventos"
          title="Eventos y conciertos"
          description={
            events.some((event) => event.isExample)
              ? "Ejemplos ilustrativos. Consulta por artistas, fechas y entradas disponibles."
              : "Consulta por fechas y entradas disponibles."
          }
          action={{ label: "Ver todos los eventos", href: "/events" }}
          tone="surface"
        >
          <ul className={`${gridClass} lg:grid-cols-3`}>
            {events.map((event) => (
              <li key={event.slug}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {nationalDestinations.length > 0 && (
        <Section
          id="nacionales"
          title="Destinos nacionales"
          description="Descubre Bolivia: salares, selva, valles y ciudades con historia."
          action={{ label: "Ver viajes por Bolivia", href: "/destinations/bolivia" }}
          tone="sand"
        >
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {nationalDestinations.map((destination) => (
              <li key={destination.slug}>
                <DestinationCard
                  destination={destination}
                  variant="compact"
                  note="Consulta fechas recomendadas"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <section
        aria-labelledby="newsletter-title"
        className="relative isolate overflow-hidden text-white"
      >
        <SafeImage
          src="/images/newsletter-cta.jpg"
          alt=""
          label="Universal Tours"
          showLabel={false}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-travel-primary-dark/75" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="newsletter-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Recibe ideas para tu próximo viaje
          </h2>
          <p className="mt-2 max-w-xl text-white/90">
            Déjanos tu correo para novedades de destinos, paquetes y experiencias.
          </p>
          <NewsletterForm />
        </div>
      </section>

      <section aria-labelledby="cta-title" className="bg-travel-accent-light">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 id="cta-title" className="text-2xl font-semibold tracking-tight text-travel-primary-dark">
              ¿Listo para planear tu viaje?
            </h2>
            <p className="mt-1 text-travel-text">
              Cuéntanos qué tienes en mente y armamos una cotización a tu medida.
            </p>
          </div>
          <Link href="/quote" className={`${buttonStyles.secondary} shrink-0`}>
            Cotizar mi viaje
          </Link>
        </div>
      </section>
    </main>
  );
}
