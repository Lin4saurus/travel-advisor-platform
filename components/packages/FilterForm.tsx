import Link from "next/link";
import { buttonStyles } from "@/components/ui/buttons";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { availabilityLabels, includeLabels, sortLabels } from "@/config/packages";
import { durationOptions } from "@/config/search";
import { categories } from "@/data/categories";
import {
  availableSorts,
  queryToParams,
  type Facets,
  type IncludeKey,
  type PackageQuery,
} from "@/lib/packages";

type FilterFormProps = {
  // Prefijo de los `id` (el formulario se pinta dos veces: barra lateral y cajón móvil).
  idPrefix: string;
  query: PackageQuery;
  facets: Facets;
  destinationNames: string[];
};

// Formulario GET a /packages: funciona sin JavaScript. Solo muestra los grupos para los que el catálogo
// tiene datos; los criterios de la URL que no se muestran viajan en campos ocultos para no perderse.
export default function FilterForm({ idPrefix, query, facets, destinationNames }: FilterFormProps) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const typeOptions = categories.filter((category) => facets.types.includes(category.slug));
  const includeKeys = (Object.keys(includeLabels) as IncludeKey[]).filter((key) => facets.includes[key]);
  const sorts = availableSorts(facets);

  const rendered = [
    "sort",
    "destination",
    "region",
    ...(typeOptions.length > 0 ? ["type"] : []),
    ...(facets.hasDuration ? ["duration"] : []),
    ...(facets.seasons.length > 0 ? ["season"] : []),
    ...(facets.price ? ["price_min", "price_max"] : []),
    ...(facets.boards.length > 0 ? ["board"] : []),
    ...includeKeys,
    ...(facets.availabilities.length > 0 ? ["availability"] : []),
    ...(facets.tags.length > 0 ? ["tag"] : []),
  ];
  const hiddenFields = [...queryToParams(query, rendered).entries()];

  return (
    <form action="/packages" method="get" className="space-y-5">
      {hiddenFields.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div>
        <label htmlFor={id("sort")} className={labelClass}>
          Ordenar por
        </label>
        <select id={id("sort")} name="sort" defaultValue={query.sort} className={fieldClass}>
          {sorts.map((sort) => (
            <option key={sort} value={sort}>
              {sortLabels[sort]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={id("destination")} className={labelClass}>
          Destino
        </label>
        <input
          id={id("destination")}
          name="destination"
          type="text"
          list={id("destination-list")}
          autoComplete="off"
          defaultValue={query.destination ?? ""}
          placeholder="Ciudad, país o paquete"
          className={fieldClass}
        />
        <datalist id={id("destination-list")}>
          {destinationNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor={id("region")} className={labelClass}>
          Región
        </label>
        <select id={id("region")} name="region" defaultValue={query.region ?? ""} className={fieldClass}>
          <option value="">Todas</option>
          {facets.regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {typeOptions.length > 0 && (
        <div>
          <label htmlFor={id("type")} className={labelClass}>
            Tipo de viaje
          </label>
          <select id={id("type")} name="type" defaultValue={query.type ?? ""} className={fieldClass}>
            <option value="">Todos</option>
            {typeOptions.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {facets.hasDuration && (
        <div>
          <label htmlFor={id("duration")} className={labelClass}>
            Duración
          </label>
          <select id={id("duration")} name="duration" defaultValue={query.duration ?? ""} className={fieldClass}>
            <option value="">Cualquiera</option>
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {facets.seasons.length > 0 && (
        <div>
          <label htmlFor={id("season")} className={labelClass}>
            Temporada
          </label>
          <select id={id("season")} name="season" defaultValue={query.season ?? ""} className={fieldClass}>
            <option value="">Cualquiera</option>
            {facets.seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>
      )}

      {facets.price && (
        <fieldset>
          <legend className={labelClass}>Precio ({facets.price.currency})</legend>
          {/* Dos columnas en el cajón móvil (ancho); apilados en la barra lateral (16rem), donde no caben. */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-0">
            <div>
              <label htmlFor={id("price-min")} className="sr-only">
                Precio mínimo
              </label>
              <input
                id={id("price-min")}
                name="price_min"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                defaultValue={query.priceMin ?? ""}
                placeholder={`Mín. ${facets.price.min}`}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor={id("price-max")} className="sr-only">
                Precio máximo
              </label>
              <input
                id={id("price-max")}
                name="price_max"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                defaultValue={query.priceMax ?? ""}
                placeholder={`Máx. ${facets.price.max}`}
                className={fieldClass}
              />
            </div>
          </div>
        </fieldset>
      )}

      {facets.boards.length > 0 && (
        <div>
          <label htmlFor={id("board")} className={labelClass}>
            Régimen
          </label>
          <select id={id("board")} name="board" defaultValue={query.board ?? ""} className={fieldClass}>
            <option value="">Cualquiera</option>
            {facets.boards.map((board) => (
              <option key={board} value={board}>
                {board}
              </option>
            ))}
          </select>
        </div>
      )}

      {includeKeys.length > 0 && (
        <fieldset>
          <legend className={labelClass}>Incluye</legend>
          <div className="mt-2 space-y-2">
            {includeKeys.map((key) => (
              <label key={key} htmlFor={id(key)} className="flex items-center gap-2 text-sm text-travel-text">
                <input
                  id={id(key)}
                  name={key}
                  type="checkbox"
                  value="1"
                  defaultChecked={query[key] === true}
                  className="size-5 accent-travel-primary"
                />
                {includeLabels[key]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {facets.availabilities.length > 0 && (
        <div>
          <label htmlFor={id("availability")} className={labelClass}>
            Disponibilidad
          </label>
          <select
            id={id("availability")}
            name="availability"
            defaultValue={query.availability ?? ""}
            className={fieldClass}
          >
            <option value="">Cualquiera</option>
            {facets.availabilities.map((availability) => (
              <option key={availability} value={availability}>
                {availabilityLabels[availability]}
              </option>
            ))}
          </select>
        </div>
      )}

      {facets.tags.length > 0 && (
        <div>
          <label htmlFor={id("tag")} className={labelClass}>
            Etiqueta
          </label>
          <select id={id("tag")} name="tag" defaultValue={query.tag ?? ""} className={fieldClass}>
            <option value="">Todas</option>
            {facets.tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" className={`${buttonStyles.secondary} h-11`}>
          Aplicar filtros
        </button>
        <Link href="/packages" className={`${buttonStyles.outline} h-11`}>
          Limpiar filtros
        </Link>
      </div>
    </form>
  );
}
