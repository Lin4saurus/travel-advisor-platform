import Link from "next/link";
import { notFound } from "next/navigation";
import NationalOverview, { NATIONAL_OVERVIEW_SLUG } from "@/components/destinations/NationalOverview";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";
import { categories, type TravelCategory } from "@/data/categories";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog/read";
import { metaDescription, pageMetadata } from "@/lib/seo";

// Desde M12 los destinos se crean en el panel: un slug nuevo tiene que funcionar sin volver a compilar, así que
// esta página ya no se prerenderiza (`generateStaticParams` + `dynamicParams = false` habrían dado 404 a todo lo
// nuevo). Se renderiza en cada visita con el catálogo cacheado (lib/catalog/read.ts), y como no hay HTML
// prerenderizado en disco, un `notFound()` ya no puede sobrescribir una página válida (el problema de las
// variantes en mayúsculas que documentaba CLAUDE.md) ni escribir archivos por cada slug inventado.
export const dynamic = "force-dynamic";

// La canónica usa el slug real (en minúsculas): /destinations/CARTAGENA muestra la misma página, pero los
// buscadores la atribuyen a /destinations/cartagena (pendiente detectado en M3).
export async function generateMetadata(props: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const slug = (await props.params).slug.toLowerCase();
  if (slug === NATIONAL_OVERVIEW_SLUG) {
    return pageMetadata({
      title: "Viajes nacionales: Bolivia",
      description: "Salares, selva, valles y ciudades con historia: destinos y paquetes para viajar por Bolivia.",
      path: "/destinations/bolivia",
    });
  }
  const destination = (await getCatalog()).destinations.find((item) => item.slug === slug);
  if (!destination) return {};
  return pageMetadata({
    title: destination.location ? `${destination.name}, ${destination.location}` : destination.name,
    description: metaDescription(destination.summary, destination.description),
    path: `/destinations/${destination.slug}`,
    image: destination.image,
  });
}

export default async function DestinationPage(
  props: PageProps<"/destinations/[slug]">,
) {
  const { slug } = await props.params;
  // /destinations/Bolivia (u otra variante en mayúsculas) llega aquí y no a la ruta estática hermana
  // /destinations/bolivia: se muestra la misma página en vez de un 404. Por eso "bolivia" está reservado como
  // slug de destino en el panel.
  if (slug.toLowerCase() === NATIONAL_OVERVIEW_SLUG) return <NationalOverview />;
  const { destinations } = await getCatalog();
  const destination = destinations.find((item) => item.slug === slug.toLowerCase());
  if (!destination) notFound();

  const experienceTypes = destination.experienceTypes
    .map((typeSlug) => categories.find((category) => category.slug === typeSlug))
    .filter((category): category is TravelCategory => category !== undefined);
  const isNational = destination.scope === "national";

  return (
    <main className="flex-1">
      <section
        aria-labelledby="destination-title"
        className="relative isolate overflow-hidden text-white"
      >
        <SafeImage
          src={destination.image}
          alt={`Imagen ilustrativa de ${destination.name}`}
          label={destination.name}
          showLabel={false}
          sizes="100vw"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-travel-primary-dark/90 via-travel-primary-dark/55 to-travel-primary-dark/30" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
          <Link
            href="/destinations"
            className="rounded-sm text-sm text-white/90 underline-offset-4 hover:underline"
          >
            <span aria-hidden="true">←</span> Volver a destinos
          </Link>
          <p className="mt-16 text-sm font-semibold text-travel-accent-light sm:mt-24">
            {isNational ? "Destino nacional" : "Destino internacional"} · {destination.location}
          </p>
          <h1
            id="destination-title"
            className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            {destination.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">{destination.summary}</p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          <section aria-labelledby="about-title">
            <h2 id="about-title" className="text-2xl font-semibold text-travel-primary-dark">
              Sobre {destination.name}
            </h2>
            <p className="mt-3 text-travel-text">{destination.description}</p>
          </section>

          <section aria-labelledby="types-title">
            <h2 id="types-title" className="text-2xl font-semibold text-travel-primary-dark">
              Tipo de experiencia
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {experienceTypes.map((type) => (
                <li key={type.slug}>
                  <Link
                    href={`/packages?type=${type.slug}`}
                    className="inline-block rounded-full border border-travel-primary px-4 py-1.5 text-sm font-medium text-travel-primary hover:bg-travel-surface"
                  >
                    {type.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="gallery-title">
            <h2 id="gallery-title" className="text-2xl font-semibold text-travel-primary-dark">
              Galería
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {destination.gallery.map((photo, index) => (
                <li key={photo}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <SafeImage
                      src={photo}
                      alt={`${destination.name}, foto ${index + 1}`}
                      label={`${destination.name} · foto ${index + 1}`}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 100vw"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside
          aria-labelledby="inquiry-title"
          className="h-fit rounded-2xl border border-travel-border bg-travel-surface p-6 lg:sticky lg:top-24"
        >
          <h2 id="inquiry-title" className="text-xl font-semibold text-travel-primary-dark">
            ¿Te interesa {destination.name}?
          </h2>
          <p className="mt-2 text-sm text-travel-muted">
            Cuéntanos tus fechas y cuántas personas viajan, y te preparamos una cotización.{" "}
            {isNational ? "Consulta fechas recomendadas." : "Consulta fechas y precios."}
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href={`/quote?destination=${destination.slug}`}
              className={buttonStyles.primary}
            >
              Consultar por este destino
            </Link>
            <Link
              href={`/packages?destination=${encodeURIComponent(destination.name)}`}
              className={buttonStyles.outline}
            >
              Ver paquetes
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
