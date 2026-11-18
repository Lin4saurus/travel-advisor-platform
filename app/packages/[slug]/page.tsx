import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import PackageCard from "@/components/PackageCard";
import Section from "@/components/Section";
import LikeButton from "@/components/LikeButton";
import ItineraryTimeline from "@/components/packages/ItineraryTimeline";
import PackageGallery from "@/components/packages/PackageGallery";
import BulletList from "@/components/ui/BulletList";
import { buttonStyles } from "@/components/ui/buttons";
import {
  availabilityLabels,
  conditions,
  defaultExclusions,
  defaultFaq,
  importantInfo,
  includeLabels,
  recommendations,
} from "@/config/packages";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog/read";
import { metaDescription, pageMetadata } from "@/lib/seo";
import { formatDate, formatDuration, formatPrice } from "@/lib/format";
import { getLikeState } from "@/lib/likes";
import { relatedPackages } from "@/lib/packages";
import type { ReactNode } from "react";

// Sin prerender desde M12 (los paquetes se crean en el panel): ver el comentario de `dynamic` en
// `app/destinations/[slug]/page.tsx`.
export const dynamic = "force-dynamic";

// Canónica con el slug real en minúsculas (ver app/destinations/[slug]/page.tsx).
export async function generateMetadata(props: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const slug = (await props.params).slug.toLowerCase();
  const pkg = (await getCatalog()).packages.find((item) => item.slug === slug);
  if (!pkg) return {};
  return pageMetadata({
    title: pkg.destination ? `${pkg.name} (${pkg.destination})` : pkg.name,
    description: metaDescription(pkg.summary, pkg.description),
    path: `/packages/${pkg.slug}`,
    image: pkg.image,
  });
}

function DetailSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-2xl font-semibold text-travel-primary-dark">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function PackagePage(props: PageProps<"/packages/[slug]">) {
  const { slug } = await props.params;
  // En minúsculas: /packages/CARTAGENA-CARIBE muestra el mismo paquete (la URL canónica queda para M13).
  const { destinations, packages } = await getCatalog();
  const pkg = packages.find((item) => item.slug === slug.toLowerCase());
  if (!pkg) notFound();

  const destination = pkg.destinationSlug
    ? destinations.find((item) => item.slug === pkg.destinationSlug)
    : undefined;
  const related = relatedPackages(pkg, packages, 3);
  const likes = await getLikeState("packages", pkg.slug);
  const includeKeys = Object.keys(includeLabels) as Array<keyof typeof includeLabels>;

  // Solo lo confirmado: true → incluido, false → no incluido, null → no se dice nada.
  const included = [
    ...(pkg.board ? [`Régimen: ${pkg.board}`] : []),
    ...includeKeys.filter((key) => pkg.includes[key] === true).map((key) => includeLabels[key]),
    ...pkg.included,
  ];
  const notIncluded = [
    ...includeKeys.filter((key) => pkg.includes[key] === false).map((key) => includeLabels[key]),
    ...pkg.excluded,
  ];
  const faq = [...pkg.faq, ...defaultFaq];

  const facts: Array<[string, string]> = [
    ["Duración", pkg.durationDays === null ? "A consultar" : formatDuration(pkg.durationDays)],
    ["Temporada", pkg.season ?? "A consultar"],
    ["Próxima salida", pkg.nextDeparture ? formatDate(pkg.nextDeparture) : "Consultar fechas"],
    ["Disponibilidad", pkg.availability ? availabilityLabels[pkg.availability] : "A consultar"],
  ];

  const toc = [
    ...(destination ? [{ id: "destino", label: "Sobre el destino" }] : []),
    { id: "incluye", label: "Qué incluye" },
    { id: "no-incluye", label: "Qué NO incluye" },
    { id: "itinerario", label: "Itinerario" },
    { id: "opcionales", label: "Opcionales" },
    { id: "recomendaciones", label: "Recomendaciones" },
    { id: "informacion", label: "Información importante" },
    { id: "condiciones", label: "Condiciones" },
    { id: "faq", label: "Preguntas frecuentes" },
    ...(related.length > 0 ? [{ id: "relacionados", label: "Relacionados" }] : []),
  ];

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb
          items={[{ label: "Inicio", href: "/" }, { label: "Paquetes", href: "/packages" }, { label: pkg.name }]}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PackageGallery name={pkg.name} images={[pkg.image, ...pkg.gallery]} />
        </div>

        <section aria-labelledby="package-title" className="lg:col-span-2">
          {pkg.badge && (
            <span className="inline-block rounded-full bg-travel-accent px-3 py-1 text-xs font-semibold text-travel-text">
              {pkg.badge}
            </span>
          )}
          <h1
            id="package-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-travel-primary-dark sm:text-4xl"
          >
            {pkg.name}
          </h1>
          <p className="mt-1 text-travel-muted">{pkg.destination}</p>
          <p className="mt-4 text-travel-text">{pkg.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-travel-border py-5 text-sm">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-travel-muted">{label}</dt>
                <dd className="mt-0.5 font-medium text-travel-text">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-2xl font-semibold text-travel-text">
            {pkg.price ? `Desde ${formatPrice(pkg.price)}` : "Consultar precio"}
          </p>
          <p className="mt-1 text-sm text-travel-muted">
            Los precios y las fechas se confirman en tu cotización.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link href={`/quote?package=${pkg.slug}`} className={buttonStyles.primary}>
              Cotizar este paquete
            </Link>
            {destination && (
              <Link href={`/destinations/${destination.slug}`} className={buttonStyles.outline}>
                Ver destino
              </Link>
            )}
          </div>
          {/* Solo con un conteo real (lib/likes.ts): si la base no responde, no se muestra. */}
          {likes && (
            <div className="mt-5">
              <LikeButton kind="packages" slug={pkg.slug} itemName={pkg.name} initial={likes} />
            </div>
          )}
        </section>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
        <nav aria-label="En esta página" className="border-y border-travel-border py-3">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="rounded-sm text-travel-primary underline-offset-4 hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 max-w-3xl space-y-12">
          {destination && (
            <DetailSection id="destino" title={`Sobre el destino: ${destination.name}`}>
              <p className="text-travel-text">{destination.description}</p>
              <Link
                href={`/destinations/${destination.slug}`}
                className="mt-3 inline-block rounded-sm text-sm font-semibold text-travel-primary underline-offset-4 hover:underline"
              >
                Ver todo sobre {destination.name} <span aria-hidden="true">→</span>
              </Link>
            </DetailSection>
          )}

          <DetailSection id="incluye" title="Qué incluye">
            {included.length > 0 && <BulletList items={included} marker="check" />}
            <p className={`text-sm text-travel-muted ${included.length > 0 ? "mt-4" : ""}`}>
              {included.length > 0
                ? "El detalle final de lo incluido se confirma en tu cotización."
                : "Los servicios incluidos en este paquete se confirman en tu cotización."}
            </p>
          </DetailSection>

          <DetailSection id="no-incluye" title="Qué NO incluye">
            {notIncluded.length > 0 && (
              <>
                <p className="mb-3 font-medium text-travel-text">No incluido en este paquete:</p>
                <BulletList items={notIncluded} marker="dot" />
              </>
            )}
            <p className={`font-medium text-travel-text ${notIncluded.length > 0 ? "mb-3 mt-6" : "mb-3"}`}>
              Salvo que tu cotización indique lo contrario, tampoco incluye:
            </p>
            <BulletList items={defaultExclusions} marker="dot" />
          </DetailSection>

          <DetailSection id="itinerario" title="Itinerario sugerido">
            {pkg.itinerary.length > 0 ? (
              <ItineraryTimeline days={pkg.itinerary} />
            ) : (
              <p className="text-travel-muted">
                El itinerario se arma según tus fechas y tus preferencias.{" "}
                <Link
                  href={`/quote?package=${pkg.slug}`}
                  className="rounded-sm font-semibold text-travel-primary underline-offset-4 hover:underline"
                >
                  Pídelo en tu cotización
                </Link>
                .
              </p>
            )}
          </DetailSection>

          <DetailSection id="opcionales" title="Opcionales">
            {pkg.optionals.length > 0 ? (
              <BulletList items={pkg.optionals} marker="dot" />
            ) : (
              <p className="text-travel-muted">
                Consulta por excursiones y actividades opcionales para este destino. También puedes
                explorar nuestras{" "}
                <Link
                  href="/experiences"
                  className="rounded-sm font-semibold text-travel-primary underline-offset-4 hover:underline"
                >
                  experiencias
                </Link>
                .
              </p>
            )}
          </DetailSection>

          <DetailSection id="recomendaciones" title="Recomendaciones">
            <BulletList items={recommendations} marker="dot" />
          </DetailSection>

          <DetailSection id="informacion" title="Información importante">
            <BulletList items={importantInfo} marker="dot" />
          </DetailSection>

          <DetailSection id="condiciones" title="Condiciones">
            <BulletList items={conditions} marker="dot" />
          </DetailSection>

          <DetailSection id="faq" title="Preguntas frecuentes">
            <div className="divide-y divide-travel-border border-y border-travel-border">
              {faq.map((item) => (
                <details key={item.question} className="py-4">
                  <summary className="cursor-pointer font-medium text-travel-text">{item.question}</summary>
                  <p className="mt-2 text-travel-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </DetailSection>
        </div>
      </div>

      {related.length > 0 && (
        <Section
          id="relacionados"
          title="Paquetes relacionados"
          description="Otros paquetes con la misma región o el mismo tipo de viaje."
          action={{ label: "Ver todos los paquetes", href: "/packages" }}
          tone="surface"
        >
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <PackageCard pkg={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </main>
  );
}
