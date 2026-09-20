// Lógica pura del catálogo de experiencias: lectura de la URL (?category=), filtro y relacionadas.
import { experienceCategories, type Experience } from "@/data/experiences";

export type RawSearchParams = Record<string, string | string[] | undefined>;

// La categoría de la URL solo cuenta si existe en `experienceCategories`; cualquier otra cosa se ignora.
export function parseCategory(raw: RawSearchParams): string | undefined {
  const value = Array.isArray(raw.category) ? raw.category[0] : raw.category;
  const category = value?.trim();
  return category && experienceCategories.some((item) => item.slug === category) ? category : undefined;
}

export function filterExperiences(all: Experience[], category?: string) {
  return category ? all.filter((experience) => experience.categories.includes(category)) : all;
}

// Cantidad de experiencias por categoría (0 para las que no tienen).
export function categoryCounts(all: Experience[]): Record<string, number> {
  return Object.fromEntries(
    experienceCategories.map((category) => [
      category.slug,
      all.filter((experience) => experience.categories.includes(category.slug)).length,
    ]),
  );
}

export function experiencesHref(category?: string) {
  return category ? `/experiences?category=${category}` : "/experiences";
}

// Relacionadas: comparten al menos una categoría (1 punto por categoría en común); a igual puntaje se conserva
// el orden original.
export function relatedExperiences(current: Experience, all: Experience[], limit = 3) {
  return all
    .map((experience, index) => ({
      experience,
      index,
      score: experience.categories.filter((slug) => current.categories.includes(slug)).length,
    }))
    .filter(({ experience, score }) => experience.slug !== current.slug && score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ experience }) => experience);
}
