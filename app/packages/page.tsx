import Link from "next/link";
import PackageCard from "@/components/PackageCard";
import PageHeader from "@/components/PageHeader";
import ActiveFilters from "@/components/packages/ActiveFilters";
import FilterForm from "@/components/packages/FilterForm";
import MobileFilterDrawer from "@/components/packages/MobileFilterDrawer";
import { buttonStyles } from "@/components/ui/buttons";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { activeFilters, applyQuery, getFacets, parseQuery, quoteHref } from "@/lib/packages";

function countText(shown: number, total: number) {
  const noun = (n: number) => (n === 1 ? "paquete" : "paquetes");
  if (shown === total) return `${total} ${noun(total)}`;
  return `Mostrando ${shown} de ${total} ${noun(total)}`;
}

// La lista se filtra y ordena en el servidor a partir de la URL (?destination=&type=&sort=…): las búsquedas
// de la Home son enlaces compartibles y los filtros funcionan sin JavaScript.
export default async function PackagesPage(props: PageProps<"/packages">) {
  const query = parseQuery(await props.searchParams);
  const facets = getFacets(packages);
  const { results, preferences } = applyQuery(packages, query, facets);
  const filterCount = activeFilters(query).length;
  const destinationNames = destinations.map((destination) => destination.name);
  const customQuote = quoteHref(query);

  return (
    <main className="flex-1">
      <PageHeader
        title="Paquetes"
        description="Explora nuestros paquetes de viaje. Si no encuentras lo que buscas, te ayudamos a armar una opción personalizada."
      >
        <Link href={customQuote} className={buttonStyles.primary}>
          Cotizar una opción personalizada
        </Link>
      </PageHeader>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[16rem_1fr]">
        <aside
          aria-labelledby="filters-title"
          className="hidden h-fit rounded-2xl border border-travel-border bg-travel-background p-5 lg:block"
        >
          <h2 id="filters-title" className="mb-4 text-lg font-semibold text-travel-primary-dark">
            Filtros
          </h2>
          <FilterForm
            idPrefix="desktop"
            query={query}
            facets={facets}
            destinationNames={destinationNames}
          />
        </aside>

        <section aria-labelledby="results-title">
          <h2 id="results-title" className="sr-only">
            Resultados
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status" aria-live="polite" className="text-sm font-medium text-travel-text">
              {countText(results.length, packages.length)}
            </p>
            <MobileFilterDrawer activeCount={filterCount}>
              <FilterForm
                idPrefix="mobile"
                query={query}
                facets={facets}
                destinationNames={destinationNames}
              />
            </MobileFilterDrawer>
          </div>

          <ActiveFilters query={query} preferences={preferences} />

          {results.length > 0 ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {results.map((pkg) => (
                <li key={pkg.slug}>
                  <PackageCard pkg={pkg} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl border border-travel-border bg-travel-surface p-8 text-center">
              <h3 className="text-xl font-semibold text-travel-primary-dark">
                No encontramos paquetes con esos filtros
              </h3>
              <p className="mx-auto mt-2 max-w-md text-travel-muted">
                Prueba quitando algún filtro, o cuéntanos qué tienes en mente y armamos una opción
                personalizada para ti.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href={customQuote} className={buttonStyles.primary}>
                  Cotizar una opción personalizada
                </Link>
                <Link href="/packages" className={buttonStyles.outline}>
                  Quitar filtros
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
