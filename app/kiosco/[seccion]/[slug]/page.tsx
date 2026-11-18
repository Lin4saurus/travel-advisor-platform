import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import KioskCard from "@/components/kiosk/KioskCard";
import QuoteQr from "@/components/kiosk/QuoteQr";
import ItineraryTimeline from "@/components/packages/ItineraryTimeline";
import SafeImage from "@/components/ui/SafeImage";
import { eventStatusLabels } from "@/config/events";
import { availabilityLabels, includeLabels } from "@/config/packages";
import { categories } from "@/data/categories";
import { eventCategories } from "@/data/events";
import { experienceCategories } from "@/data/experiences";
import { getCatalog, type Catalog } from "@/lib/catalog/read";
import { formatDate, formatDuration, formatPrice } from "@/lib/format";
import { kioskHref, kioskSection, type KioskSection } from "@/lib/kiosk";

type Detail = {
  name: string;
  image: string;
  eyebrow?: string | null;
  subtitle?: string | null;
  price?: string | null;
  notice?: string | null;
  description?: string | null;
  facts: Array<[string, string]>;
  tags: string[];
  included: string[];
  notIncluded: string[];
  extra?: ReactNode;
};

const nameOf = (list: { slug: string; name: string }[], slug: string) => list.find((item) => item.slug === slug)?.name;

function detailFor(section: KioskSection, slug: string, catalog: Catalog): Detail | null {
  switch (section.kind) {
    case "packages": {
      const pkg = catalog.packages.find((item) => item.slug === slug);
      if (!pkg) return null;
      const keys = Object.keys(includeLabels) as Array<keyof typeof includeLabels>;
      return {
        name: pkg.name,
        image: pkg.image,
        eyebrow: pkg.badge,
        subtitle: pkg.destination,
        price: pkg.price ? `Desde ${formatPrice(pkg.price)}` : "Consultar precio",
        description: pkg.description || pkg.summary,
        facts: [
          ["Duración", pkg.durationDays ? formatDuration(pkg.durationDays) : "A consultar"],
          ["Temporada", pkg.season ?? "A consultar"],
          ["Próxima salida", pkg.nextDeparture ? formatDate(pkg.nextDeparture) : "Consultar fechas"],
          ["Disponibilidad", pkg.availability ? availabilityLabels[pkg.availability] : "A consultar"],
        ],
        tags: pkg.types.map((type) => nameOf(categories, type)).filter((name): name is string => Boolean(name)),
        // Solo lo confirmado (true/false); lo desconocido (null) no se afirma ni se niega.
        included: [
          ...(pkg.board ? [`Régimen: ${pkg.board}`] : []),
          ...keys.filter((key) => pkg.includes[key] === true).map((key) => includeLabels[key]),
          ...pkg.included,
        ],
        notIncluded: [...keys.filter((key) => pkg.includes[key] === false).map((key) => includeLabels[key]), ...pkg.excluded],
        extra:
          pkg.itinerary.length > 0 ? (
            <section aria-labelledby="kiosk-itinerary" className="rounded-3xl bg-travel-background p-8">
              <h2 id="kiosk-itinerary" className="mb-6 text-3xl font-semibold text-travel-primary-dark">
                Itinerario sugerido
              </h2>
              <ItineraryTimeline days={pkg.itinerary} />
            </section>
          ) : null,
      };
    }
    case "destinations": {
      const destination = catalog.destinations.find((item) => item.slug === slug);
      if (!destination) return null;
      const related = catalog.packages.filter((pkg) => pkg.destinationSlug === destination.slug);
      return {
        name: destination.name,
        image: destination.image,
        eyebrow: destination.scope === "national" ? "Bolivia" : "Internacional",
        subtitle: destination.location,
        description: destination.description || destination.summary,
        facts: [],
        tags: destination.experienceTypes.map((type) => nameOf(categories, type)).filter((name): name is string => Boolean(name)),
        included: [],
        notIncluded: [],
        extra:
          related.length > 0 ? (
            <section aria-labelledby="kiosk-related" className="space-y-6">
              <h2 id="kiosk-related" className="text-3xl font-semibold text-travel-primary-dark">
                Paquetes a {destination.name}
              </h2>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((pkg) => (
                  <li key={pkg.slug}>
                    <KioskCard
                      href={kioskHref("paquetes", pkg.slug)}
                      image={pkg.image}
                      title={pkg.name}
                      subtitle={pkg.destination}
                      footer={pkg.price ? `Desde ${formatPrice(pkg.price)}` : "Consultar precio"}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
      };
    }
    case "experiences": {
      const experience = catalog.experiences.find((item) => item.slug === slug);
      if (!experience) return null;
      return {
        name: experience.name,
        image: experience.image,
        subtitle: experience.location,
        description: experience.description || experience.summary,
        facts: [
          ["Ciudad", experience.location ?? "A consultar"],
          ["Duración", experience.duration ?? "A consultar"],
          ["Disponibilidad", experience.availability ? availabilityLabels[experience.availability] : "A consultar"],
        ],
        tags: experience.categories.map((item) => nameOf(experienceCategories, item)).filter((name): name is string => Boolean(name)),
        included: experience.includes,
        notIncluded: [],
      };
    }
    case "events": {
      const event = catalog.events.find((item) => item.slug === slug);
      if (!event) return null;
      return {
        name: event.name,
        image: event.image,
        eyebrow: nameOf(eventCategories, event.category),
        notice: event.isExample
          ? "Ejemplo ilustrativo: no es un evento confirmado. Consulta por artistas, fechas y entradas disponibles."
          : null,
        description: event.summary,
        facts: [
          ["Ciudad", event.city ?? "A consultar"],
          ["Fecha", event.date ? formatDate(event.date) : "Por confirmar"],
          ["Duración", event.duration ?? "A consultar"],
          ["Estado", eventStatusLabels[event.status]],
        ],
        tags: [],
        included: event.includes,
        notIncluded: [],
      };
    }
  }
}

function List({ title, items, tone }: { title: string; items: string[]; tone: "yes" | "no" }) {
  return (
    <section className="rounded-3xl bg-travel-background p-8">
      <h2 className="text-2xl font-semibold text-travel-primary-dark">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-xl text-travel-text">
            <span aria-hidden="true" className={tone === "yes" ? "text-travel-success" : "text-travel-muted"}>
              {tone === "yes" ? "✓" : "–"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function generateMetadata(props: PageProps<"/kiosco/[seccion]/[slug]">): Promise<Metadata> {
  const { seccion, slug } = await props.params;
  const section = kioskSection(seccion);
  const detail = section ? detailFor(section, slug.toLowerCase(), await getCatalog()) : null;
  return { title: detail?.name ?? "Kiosco" };
}

export default async function KioskDetailPage(props: PageProps<"/kiosco/[seccion]/[slug]">) {
  const { seccion, slug } = await props.params;
  const section = kioskSection(seccion);
  if (!section) notFound();
  const detail = detailFor(section, slug.toLowerCase(), await getCatalog());
  if (!detail) notFound();

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-md">
          <SafeImage src={detail.image} alt={`Imagen ilustrativa de ${detail.name}`} label={detail.name} sizes="(min-width: 1024px) 50vw, 100vw" eager />
        </div>
        <div className="flex flex-col">
          {detail.eyebrow && (
            <span className="w-fit rounded-full bg-travel-accent px-4 py-1 text-lg font-semibold text-travel-text">{detail.eyebrow}</span>
          )}
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-travel-primary-dark">{detail.name}</h1>
          {detail.subtitle && <p className="mt-2 text-2xl text-travel-muted">{detail.subtitle}</p>}
          {detail.price && <p className="mt-5 text-4xl font-semibold text-travel-text">{detail.price}</p>}
          {detail.notice && (
            <p className="mt-5 rounded-2xl bg-travel-accent-light px-5 py-4 text-lg text-travel-text">{detail.notice}</p>
          )}
          {detail.description && <p className="mt-5 text-xl leading-relaxed text-travel-text">{detail.description}</p>}
          {detail.tags.length > 0 && (
            <ul aria-label="Tipo de viaje" className="mt-5 flex flex-wrap gap-2">
              {detail.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-travel-background px-4 py-1.5 text-base font-medium text-travel-primary ring-1 ring-travel-primary">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {detail.facts.length > 0 && (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {detail.facts.map(([label, value]) => (
            <div key={label} className="rounded-3xl bg-travel-background p-6">
              <dt className="text-lg text-travel-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold text-travel-text">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {(detail.included.length > 0 || detail.notIncluded.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {detail.included.length > 0 && <List title="Incluye" items={detail.included} tone="yes" />}
          {detail.notIncluded.length > 0 && <List title="No incluye" items={detail.notIncluded} tone="no" />}
        </div>
      )}

      {detail.extra}

      <QuoteQr path={`/quote?${section.quoteParam}=${encodeURIComponent(slug.toLowerCase())}`} title={`Cotiza ${detail.name} desde tu celular`} />

      <p className="text-center text-base text-travel-muted">
        Precios, fechas y disponibilidad son referenciales y se confirman en tu cotización.
      </p>
    </div>
  );
}
