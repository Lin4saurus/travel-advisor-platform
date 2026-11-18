import Link from "next/link";
import CategoryNav from "@/components/CategoryNav";
import ExperienceCard from "@/components/ExperienceCard";
import PageHeader from "@/components/PageHeader";
import { buttonStyles } from "@/components/ui/buttons";
import { experienceCategories } from "@/data/experiences";
import { getCatalog } from "@/lib/catalog/read";
import { hasQuery, pageMetadata } from "@/lib/seo";

// Un filtro de categoría es una vista de la misma lista: canónica a /experiences y sin indexar.
export async function generateMetadata(props: PageProps<"/experiences">) {
  return pageMetadata({
    title: "Experiencias y excursiones",
    description:
      "Suma actividades a tu viaje: visitas guiadas, paseos en barco, museos, naturaleza y más. Consulta disponibilidad y condiciones.",
    path: "/experiences",
    image: "/images/experiences/visita-guiada.jpg",
    noindex: hasQuery(await props.searchParams),
  });
}
import {
  categoryCounts,
  experiencesHref,
  filterExperiences,
  parseCategory,
} from "@/lib/experiences";

function countText(shown: number) {
  return `${shown} ${shown === 1 ? "experiencia" : "experiencias"}`;
}

// Se filtra en el servidor a partir de la URL (?category=<slug>): los enlaces son compartibles.
export default async function ExperiencesPage(props: PageProps<"/experiences">) {
  const category = parseCategory(await props.searchParams);
  const { experiences } = await getCatalog();
  const results = filterExperiences(experiences, category);
  const counts = categoryCounts(experiences);
  const activeName = experienceCategories.find((item) => item.slug === category)?.name;

  return (
    <main className="flex-1">
      <PageHeader
        title="Experiencias y excursiones"
        description="Suma actividades a tu viaje: visitas guiadas, paseos, museos y más. Consulta disponibilidad y condiciones."
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <CategoryNav
          label="Categorías de experiencias"
          total={experiences.length}
          items={experienceCategories.map((item) => ({
            slug: item.slug,
            name: item.name,
            count: counts[item.slug],
          }))}
          active={category}
          hrefFor={experiencesHref}
          emptyHint="Todavía no hay experiencias en esta categoría"
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
              {results.map((experience) => (
                <li key={experience.slug}>
                  <ExperienceCard experience={experience} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-travel-border bg-travel-surface p-8 text-center">
              <h3 className="text-xl font-semibold text-travel-primary-dark">
                Todavía no hay experiencias en «{activeName}»
              </h3>
              <p className="mx-auto mt-2 max-w-md text-travel-muted">
                Cuéntanos qué te gustaría hacer y consultamos opciones para ti.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/quote" className={buttonStyles.primary}>
                  Consultar por experiencias
                </Link>
                <Link href={experiencesHref()} className={buttonStyles.outline}>
                  Ver todas las experiencias
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
