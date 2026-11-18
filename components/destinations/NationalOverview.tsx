import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import DestinationCard from "@/components/DestinationCard";
import PackageCard from "@/components/PackageCard";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { buttonStyles } from "@/components/ui/buttons";
import { getCatalog } from "@/lib/catalog/read";

// Segmento de URL de la página de viajes nacionales. Es una ruta estática hermana de `[slug]`; ver
// `app/destinations/[slug]/page.tsx` para saber por qué esa página también la renderiza.
export const NATIONAL_OVERVIEW_SLUG = "bolivia";

// Viajes nacionales. Sin temporadas, fechas ni precios propios: cada destino remite a "Consulta fechas
// recomendadas" y los paquetes muestran lo que tengan confirmado (o "Consultar precio").
export default async function NationalOverview() {
  const { destinations, packages } = await getCatalog();
  const nationalDestinations = destinations.filter((destination) => destination.scope === "national");
  // "Bolivia" es la región comercial de `data/packages.ts` (filtro "Región" de /packages).
  const boliviaPackages = packages.filter((pkg) => pkg.region === "Bolivia");

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Destinos", href: "/destinations" },
            { label: "Bolivia" },
          ]}
        />
      </div>

      <PageHeader
        title="Viajes nacionales: Bolivia"
        description="Salares, selva, valles y ciudades con historia. Las fechas recomendadas de cada destino se consultan al cotizar."
      >
        <Link href="/quote?type=escapadas-nacionales" className={buttonStyles.primary}>
          Cotizar una escapada por Bolivia
        </Link>
      </PageHeader>

      <Section
        id="destinos"
        title="Destinos de Bolivia"
        description="Elige un destino para ver su descripción y pedir una cotización."
      >
        {nationalDestinations.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {nationalDestinations.map((destination) => (
              <li key={destination.slug}>
                <DestinationCard destination={destination} note="Consulta fechas recomendadas" />
              </li>
            ))}
          </ul>
        ) : (
          // Catálogo vacío (M13): todo despublicado desde el panel, o todavía sin cargar.
          <p className="rounded-2xl border border-travel-border bg-travel-background p-8 text-center text-travel-muted">
            Estamos actualizando los destinos nacionales. Mientras tanto, cuéntanos a dónde quieres ir con el botón de
            cotización.
          </p>
        )}
      </Section>

      {boliviaPackages.length > 0 && (
        <Section
          id="paquetes"
          title="Paquetes en Bolivia"
          description="Paquetes por el país. Precios y fechas se confirman en tu cotización."
          action={{ label: "Ver paquetes en Bolivia", href: "/packages?region=Bolivia" }}
          tone="surface"
        >
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boliviaPackages.map((pkg) => (
              <li key={pkg.slug}>
                <PackageCard pkg={pkg} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <section aria-labelledby="cta-title" className="bg-travel-accent-light">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 id="cta-title" className="text-2xl font-semibold tracking-tight text-travel-primary-dark">
              ¿Planeas una escapada por Bolivia?
            </h2>
            <p className="mt-1 text-travel-text">
              Cuéntanos qué destinos te interesan y armamos una cotización a tu medida.
            </p>
          </div>
          <Link href="/quote?type=escapadas-nacionales" className={`${buttonStyles.secondary} shrink-0`}>
            Cotizar mi viaje
          </Link>
        </div>
      </section>
    </main>
  );
}
