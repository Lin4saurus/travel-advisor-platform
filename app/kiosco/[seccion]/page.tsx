import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import KioskCard from "@/components/kiosk/KioskCard";
import { eventStatusLabels } from "@/config/events";
import { getCatalog, type Catalog } from "@/lib/catalog/read";
import { formatDate, formatDuration, formatPrice } from "@/lib/format";
import { kioskHref, kioskSection, type KioskSection } from "@/lib/kiosk";

type Card = { slug: string; image: string; title: string; subtitle?: string | null; tag?: string | null; footer?: string | null; filters: string[] };

// Cada tipo del catálogo se muestra como tarjetas con lo esencial y los valores de filtro que le corresponden.
function cardsFor(section: KioskSection, catalog: Catalog): Card[] {
  switch (section.kind) {
    case "packages":
      return catalog.packages.map((pkg) => ({
        slug: pkg.slug,
        image: pkg.image,
        title: pkg.name,
        subtitle: [pkg.destination, pkg.durationDays ? formatDuration(pkg.durationDays) : null].filter(Boolean).join(" · "),
        tag: pkg.badge,
        footer: pkg.price ? `Desde ${formatPrice(pkg.price)}` : "Consultar precio",
        filters: pkg.types,
      }));
    case "destinations":
      return catalog.destinations.map((destination) => ({
        slug: destination.slug,
        image: destination.image,
        title: destination.name,
        subtitle: destination.location,
        tag: destination.scope === "national" ? "Bolivia" : null,
        filters: [destination.scope === "national" ? "nacional" : "internacional"],
      }));
    case "experiences":
      return catalog.experiences.map((experience) => ({
        slug: experience.slug,
        image: experience.image,
        title: experience.name,
        subtitle: [experience.location ?? "Ciudad a consultar", experience.duration].filter(Boolean).join(" · "),
        filters: experience.categories,
      }));
    case "events":
      return catalog.events.map((event) => ({
        slug: event.slug,
        image: event.image,
        title: event.name,
        subtitle: [event.city ?? "Ciudad a consultar", event.date ? formatDate(event.date) : "Fecha por confirmar"].join(" · "),
        tag: event.isExample ? "Ejemplo ilustrativo" : eventStatusLabels[event.status],
        filters: [event.category],
      }));
  }
}

export async function generateMetadata(props: PageProps<"/kiosco/[seccion]">): Promise<Metadata> {
  const section = kioskSection((await props.params).seccion);
  return { title: section?.title ?? "Kiosco" };
}

export default async function KioskSectionPage(props: PageProps<"/kiosco/[seccion]">) {
  const section = kioskSection((await props.params).seccion);
  if (!section) notFound();
  const { filtro } = await props.searchParams;

  const cards = cardsFor(section, await getCatalog());
  // Solo se ofrecen los filtros que tienen algo (un chip que lleva a una lista vacía frustra en una pantalla táctil).
  const filters = section.filters.filter((filter) => cards.some((card) => card.filters.includes(filter.value)));
  const active = typeof filtro === "string" && filters.some((filter) => filter.value === filtro) ? filtro : undefined;
  const shown = active ? cards.filter((card) => card.filters.includes(active)) : cards;

  const chip = (selected: boolean) =>
    `inline-flex min-h-14 items-center rounded-full px-6 text-lg font-semibold whitespace-nowrap ${
      selected ? "bg-travel-primary text-white" : "bg-travel-background text-travel-primary ring-2 ring-travel-primary"
    }`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight text-travel-primary-dark">{section.title}</h1>
        <p className="mt-2 text-2xl text-travel-muted">{section.subtitle}</p>
      </div>

      {filters.length > 1 && (
        <nav aria-label="Filtrar" className="-mx-6 overflow-x-auto px-6 pb-2">
          <ul className="flex gap-3">
            <li>
              <Link href={kioskHref(section.id)} aria-current={!active ? "page" : undefined} className={chip(!active)}>
                Todos
              </Link>
            </li>
            {filters.map((filter) => (
              <li key={filter.value}>
                <Link
                  href={kioskHref(section.id, undefined, filter.value)}
                  aria-current={active === filter.value ? "page" : undefined}
                  className={chip(active === filter.value)}
                >
                  {filter.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <h2 className="sr-only">Resultados</h2>
      {shown.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((card) => (
            <li key={card.slug}>
              <KioskCard
                href={kioskHref(section.id, card.slug)}
                image={card.image}
                title={card.title}
                subtitle={card.subtitle}
                tag={card.tag}
                footer={card.footer}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl bg-travel-background p-10 text-center text-2xl text-travel-muted">
          Estamos actualizando esta sección. Pregunta en el mostrador: te ayudamos con gusto.
        </p>
      )}
    </div>
  );
}
