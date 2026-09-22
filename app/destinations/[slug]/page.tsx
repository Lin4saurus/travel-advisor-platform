import Link from "next/link";
import { notFound } from "next/navigation";
import NationalOverview, { NATIONAL_OVERVIEW_SLUG } from "@/components/destinations/NationalOverview";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";
import { categories, type TravelCategory } from "@/data/categories";
import { destinations } from "@/data/destinations";

// Solo se sirven los destinos de `data/destinations.ts`; cualquier otro slug responde 404 sin renderizar.
// No quitar: con `dynamicParams` en su valor por defecto Next escribe en disco (`.next/server/app/...`) un
// .html/.meta/.rsc por cada slug inventado (medido), y las peticiones al azar llenarían el disco de 404.
// Contrapartida conocida: el servidor registra "Error: Internal: NoFallbackError" por cada slug inexistente;
// el código HTTP sigue siendo 404 y es solo ruido de log.
export const dynamicParams = false;

export function generateStaticParams() {
  return destinations.map(({ slug }) => ({ slug }));
}

export default async function DestinationPage(
  props: PageProps<"/destinations/[slug]">,
) {
  const { slug } = await props.params;
  // Next resuelve las rutas prerenderizadas sin distinguir mayúsculas (/destinations/CARTAGENA llega aquí
  // con slug "CARTAGENA"). Si se llamara a notFound() por eso, Next guardaría ese 404 en disco encima de la
  // página prerenderizada de /destinations/cartagena y la dejaría rota hasta el siguiente build.
  // Lo mismo pasa con la ruta estática hermana /destinations/bolivia: /destinations/Bolivia llega aquí y su 404
  // sobrescribía bolivia.html (medido: 70 KB → 12 KB). Se renderiza la misma página en vez de dar 404.
  if (slug.toLowerCase() === NATIONAL_OVERVIEW_SLUG) return <NationalOverview />;
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
