import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ExperienceCard from "@/components/ExperienceCard";
import Section from "@/components/Section";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";
import { experienceTips } from "@/config/experiences";
import { availabilityLabels, conditions, importantInfo } from "@/config/packages";
import { experienceCategories } from "@/data/experiences";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog/read";
import { metaDescription, pageMetadata } from "@/lib/seo";
import { experiencesHref, relatedExperiences } from "@/lib/experiences";
import type { ReactNode } from "react";

// Sin prerender desde M12 (las experiencias se crean en el panel): ver el comentario de `dynamic` en
// `app/destinations/[slug]/page.tsx`.
export const dynamic = "force-dynamic";

// Canónica con el slug real en minúsculas (ver app/destinations/[slug]/page.tsx).
export async function generateMetadata(props: PageProps<"/experiences/[slug]">): Promise<Metadata> {
  const slug = (await props.params).slug.toLowerCase();
  const experience = (await getCatalog()).experiences.find((item) => item.slug === slug);
  if (!experience) return {};
  return pageMetadata({
    title: experience.location ? `${experience.name} en ${experience.location}` : experience.name,
    description: metaDescription(experience.summary, experience.description),
    path: `/experiences/${experience.slug}`,
    image: experience.image,
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

function BulletList({ items, marker }: { items: string[]; marker: "check" | "dot" }) {
  return (
    <ul className="space-y-2 text-travel-text">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className={`mt-2 size-2 shrink-0 rounded-full ${marker === "check" ? "bg-travel-success" : "bg-travel-muted"}`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ExperiencePage(props: PageProps<"/experiences/[slug]">) {
  const { slug } = await props.params;
  // En minúsculas: /experiences/VISITA-GUIADA muestra la misma experiencia (la URL canónica queda para M13).
  const { experiences } = await getCatalog();
  const experience = experiences.find((item) => item.slug === slug.toLowerCase());
  if (!experience) notFound();

  const categories = experience.categories
    .map((categorySlug) => experienceCategories.find((item) => item.slug === categorySlug))
    .filter((item) => item !== undefined);
  const related = relatedExperiences(experience, experiences, 3);
  const facts: Array<[string, string]> = [
    ["Ciudad", experience.location ?? "A consultar"],
    ["Duración", experience.duration ?? "A consultar"],
    ["Disponibilidad", experience.availability ? availabilityLabels[experience.availability] : "A consultar"],
  ];

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Experiencias", href: "/experiences" },
            { label: experience.name },
          ]}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <SafeImage
              src={experience.image}
              alt={`Imagen ilustrativa de ${experience.name}`}
              label={experience.name}
              sizes="(min-width: 1024px) 55vw, 100vw"
              eager
            />
          </div>
        </div>

        <section aria-labelledby="experience-title" className="lg:col-span-2">
          <h1
            id="experience-title"
            className="text-3xl font-semibold tracking-tight text-travel-primary-dark sm:text-4xl"
          >
            {experience.name}
          </h1>
          <ul aria-label="Categorías" className="mt-3 flex flex-wrap gap-2">
            {categories.map((item) => (
              <li key={item.slug}>
                <Link
                  href={experiencesHref(item.slug)}
                  className="inline-block rounded-full border border-travel-primary px-3 py-1 text-sm font-medium text-travel-primary hover:bg-travel-surface"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-travel-text">{experience.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-travel-border py-5 text-sm">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-travel-muted">{label}</dt>
                <dd className="mt-0.5 font-medium text-travel-text">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-sm text-travel-muted">
            La disponibilidad, los horarios y el precio se confirman en tu cotización.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link href={`/quote?experience=${experience.slug}`} className={buttonStyles.primary}>
              Consultar esta experiencia
            </Link>
            <Link href="/experiences" className={buttonStyles.outline}>
              Ver más experiencias
            </Link>
          </div>
        </section>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
        <div className="mt-6 max-w-3xl space-y-12 border-t border-travel-border pt-10">
          <DetailSection id="incluye" title="Qué incluye">
            {experience.includes.length > 0 && <BulletList items={experience.includes} marker="check" />}
            <p className={`text-sm text-travel-muted ${experience.includes.length > 0 ? "mt-4" : ""}`}>
              {experience.includes.length > 0
                ? "El detalle final de lo incluido se confirma en tu cotización."
                : "Lo que incluye esta experiencia se confirma en tu cotización."}
            </p>
          </DetailSection>

          <DetailSection id="recomendaciones" title="Recomendaciones">
            <BulletList items={experienceTips} marker="dot" />
          </DetailSection>

          <DetailSection id="informacion" title="Información importante">
            <BulletList items={importantInfo} marker="dot" />
          </DetailSection>

          <DetailSection id="condiciones" title="Condiciones">
            <BulletList items={conditions} marker="dot" />
          </DetailSection>
        </div>
      </div>

      {related.length > 0 && (
        <Section
          id="relacionadas"
          title="Experiencias relacionadas"
          description="Otras experiencias de la misma categoría."
          action={{ label: "Ver todas las experiencias", href: "/experiences" }}
          tone="surface"
        >
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ExperienceCard experience={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </main>
  );
}
