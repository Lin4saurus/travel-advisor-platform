import Link from "next/link";
import ExperienceCard from "@/components/ExperienceCard";
import PageHeader from "@/components/PageHeader";
import { buttonStyles } from "@/components/ui/buttons";
import { experienceCategories, experiences } from "@/data/experiences";
import {
  categoryCounts,
  experiencesHref,
  filterExperiences,
  parseCategory,
} from "@/lib/experiences";

const chipBase = "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium";

function countText(shown: number, total: number) {
  const noun = (n: number) => (n === 1 ? "experiencia" : "experiencias");
  if (shown === total) return `${total} ${noun(total)}`;
  return `Mostrando ${shown} de ${total} ${noun(total)}`;
}

// Se filtra en el servidor a partir de la URL (?category=<slug>): los enlaces son compartibles.
export default async function ExperiencesPage(props: PageProps<"/experiences">) {
  const category = parseCategory(await props.searchParams);
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
        <nav aria-label="Categorías de experiencias">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href={experiencesHref()}
                aria-current={category ? undefined : "page"}
                className={`${chipBase} ${
                  category
                    ? "border-travel-primary text-travel-primary hover:bg-travel-surface"
                    : "border-travel-primary bg-travel-primary text-white"
                }`}
              >
                Todas ({experiences.length})
              </Link>
            </li>
            {experienceCategories.map((item) => {
              const count = counts[item.slug];
              const active = item.slug === category;
              // Sin experiencias no hay a dónde ir: se muestra deshabilitada (salvo que ya sea la activa).
              if (count === 0 && !active) {
                return (
                  <li key={item.slug}>
                    <span
                      aria-disabled="true"
                      title="Todavía no hay experiencias en esta categoría"
                      className={`${chipBase} cursor-not-allowed border-dashed border-travel-border text-travel-muted`}
                    >
                      {item.name} (0)
                    </span>
                  </li>
                );
              }
              return (
                <li key={item.slug}>
                  <Link
                    href={experiencesHref(item.slug)}
                    aria-current={active ? "page" : undefined}
                    className={`${chipBase} ${
                      active
                        ? "border-travel-primary bg-travel-primary text-white"
                        : "border-travel-primary text-travel-primary hover:bg-travel-surface"
                    }`}
                  >
                    {item.name} ({count})
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <section aria-labelledby="results-title">
          <h2 id="results-title" className="sr-only">
            Resultados
          </h2>
          <p role="status" aria-live="polite" className="mt-6 text-sm font-medium text-travel-text">
            {activeName ? `${activeName}: ` : ""}
            {countText(results.length, activeName ? results.length : experiences.length)}
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
