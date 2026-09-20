import Link from "next/link";
import { availabilityLabels } from "@/config/packages";
import { budgetOptions, durationOptions } from "@/config/search";
import { categories } from "@/data/categories";
import type { PackageAvailability } from "@/data/packages";
import { activeFilters, packagesHref, type FilterId, type PackageQuery } from "@/lib/packages";

function label(id: FilterId, query: PackageQuery): string {
  switch (id) {
    case "destination":
      return `Destino: ${query.destination}`;
    case "region":
      return `Región: ${query.region}`;
    case "type":
      return `Tipo: ${categories.find((c) => c.slug === query.type)?.name ?? query.type}`;
    case "duration":
      return `Duración: ${durationOptions.find((o) => o.value === query.duration)?.label ?? query.duration}`;
    case "season":
      return `Temporada: ${query.season}`;
    case "board":
      return `Régimen: ${query.board}`;
    case "availability":
      return `Disponibilidad: ${availabilityLabels[query.availability as PackageAvailability]}`;
    case "tag":
      return `Etiqueta: ${query.tag}`;
    case "price":
      if (query.priceMin !== undefined && query.priceMax !== undefined) {
        return `Precio: ${query.priceMin} a ${query.priceMax}`;
      }
      return query.priceMin !== undefined ? `Precio: desde ${query.priceMin}` : `Precio: hasta ${query.priceMax}`;
    case "flights":
      return "Incluye vuelos";
    case "transfers":
      return "Incluye traslados";
    case "excursions":
      return "Incluye excursiones";
    case "date":
      return `Fecha de salida: ${query.date}`;
    case "travelers":
      return `Viajeros: ${query.travelers}`;
    case "budget":
      return `Presupuesto: ${budgetOptions.find((o) => o.value === query.budget)?.label ?? query.budget}`;
  }
}

type ActiveFiltersProps = {
  query: PackageQuery;
  // Criterios que no filtran la lista (ver `applyQuery`): se muestran con borde punteado.
  preferences: FilterId[];
};

export default function ActiveFilters({ query, preferences }: ActiveFiltersProps) {
  const filters = activeFilters(query);
  if (filters.length === 0) return null;

  return (
    <div className="mt-4">
      <ul aria-label="Filtros activos" className="flex flex-wrap gap-2">
        {filters.map(({ id, params }) => {
          const isPreference = preferences.includes(id);
          const text = label(id, query);
          return (
            <li key={id}>
              <Link
                href={packagesHref(query, params)}
                aria-label={`Quitar ${isPreference ? "preferencia" : "filtro"}: ${text}`}
                className={`inline-flex items-center gap-2 rounded-full bg-travel-surface px-3 py-1.5 text-sm text-travel-text hover:bg-travel-accent-light ${
                  isPreference ? "border border-dashed border-travel-muted" : "border border-travel-primary"
                }`}
              >
                {text}
                <span aria-hidden="true">×</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {preferences.length > 0 && (
        <p className="mt-3 text-sm text-travel-muted">
          Los criterios con borde punteado no filtran la lista (el catálogo aún no tiene ese dato o solo
          se usan al cotizar): los llevaremos a tu cotización.
        </p>
      )}
    </div>
  );
}
