import Link from "next/link";
import CategoryNav from "@/components/CategoryNav";
import EventCard from "@/components/EventCard";
import PageHeader from "@/components/PageHeader";
import { buttonStyles } from "@/components/ui/buttons";
import { eventCategories } from "@/data/events";
import { getCatalog } from "@/lib/catalog/read";
import { eventCategoryCounts, eventsHref, filterEvents, parseEventCategory } from "@/lib/events";
import { hasQuery, pageMetadata } from "@/lib/seo";

// Un filtro de categoría es una vista de la misma lista: canónica a /events y sin indexar.
export async function generateMetadata(props: PageProps<"/events">) {
  return pageMetadata({
    title: "Eventos, conciertos y entretenimiento",
    description:
      "Conciertos, festivales, ferias y parques: consulta por eventos y armamos tu viaje para asistir. Los eventos publicados son ejemplos ilustrativos.",
    path: "/events",
    image: "/images/events/festival-musica.jpg",
    noindex: hasQuery(await props.searchParams),
  });
}

function countText(shown: number) {
  return `${shown} ${shown === 1 ? "evento" : "eventos"}`;
}

// Se filtra en el servidor a partir de la URL (?category=<slug>): los enlaces son compartibles.
export default async function EventsPage(props: PageProps<"/events">) {
  const category = parseEventCategory(await props.searchParams);
  const { events } = await getCatalog();
  const results = filterEvents(events, category);
  const counts = eventCategoryCounts(events);
  const activeName = eventCategories.find((item) => item.slug === category)?.name;

  return (
    <main className="flex-1">
      <PageHeader
        title="Eventos, conciertos y entretenimiento"
        description="Conciertos, festivales, parques y más. Los eventos que ves son ejemplos ilustrativos: consulta por artistas, fechas y entradas disponibles."
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <CategoryNav
          label="Categorías de eventos"
          total={events.length}
          items={eventCategories.map((item) => ({ slug: item.slug, name: item.name, count: counts[item.slug] }))}
          active={category}
          hrefFor={eventsHref}
          emptyHint="Todavía no hay eventos en esta categoría"
        />

        <section aria-labelledby="results-title">
          <h2 id="results-title" className="sr-only">
            Resultados
          </h2>
          <p role="status" aria-live="polite" className="mt-6 text-sm font-medium text-travel-text">
            {activeName ? `${activeName}: ` : ""}
            {countText(results.length)}
          </p>

          {results.length > 0 ? (
            <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((event) => (
                <li key={event.slug}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-travel-border bg-travel-surface p-8 text-center">
              <h3 className="text-xl font-semibold text-travel-primary-dark">
                Todavía no hay eventos en «{activeName}»
              </h3>
              <p className="mx-auto mt-2 max-w-md text-travel-muted">
                Cuéntanos qué evento te interesa y consultamos opciones para ti.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/quote" className={buttonStyles.primary}>
                  Consultar por eventos
                </Link>
                <Link href={eventsHref()} className={buttonStyles.outline}>
                  Ver todos los eventos
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
