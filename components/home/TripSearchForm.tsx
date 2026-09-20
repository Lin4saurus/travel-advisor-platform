"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { buttonStyles } from "@/components/ui/buttons";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { budgetOptions, durationOptions } from "@/config/search";
import { categories } from "@/data/categories";

export default function TripSearchForm({
  destinationNames,
}: {
  destinationNames: string[];
}) {
  const router = useRouter();

  // Sin JavaScript el formulario sigue funcionando como GET nativo a /packages (con parámetros vacíos);
  // con JavaScript se arma una URL limpia, sin los parámetros vacíos.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    new FormData(event.currentTarget).forEach((value, key) => {
      const text = String(value).trim();
      if (text) params.set(key, text);
    });
    const query = params.toString();
    router.push(query ? `/packages?${query}` : "/packages");
  }

  return (
    <div className="relative z-10 mx-auto -mt-12 w-full max-w-6xl px-4 sm:px-6">
      <form
        action="/packages"
        method="get"
        onSubmit={handleSubmit}
        aria-labelledby="search-title"
        className="rounded-2xl border border-travel-border bg-travel-background p-5 shadow-xl sm:p-6"
      >
        <h2 id="search-title" className="text-lg font-semibold text-travel-primary-dark">
          Busca tu próximo viaje
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="search-destination" className={labelClass}>
              Destino
            </label>
            <input
              id="search-destination"
              name="destination"
              type="text"
              list="search-destination-list"
              autoComplete="off"
              placeholder="¿A dónde quieres ir?"
              className={fieldClass}
            />
            <datalist id="search-destination-list">
              {destinationNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="search-type" className={labelClass}>
              Tipo de viaje
            </label>
            <select id="search-type" name="type" defaultValue="" className={fieldClass}>
              <option value="">Cualquiera</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search-date" className={labelClass}>
              Fecha de salida
            </label>
            <input id="search-date" name="date" type="date" className={fieldClass} />
          </div>

          <div>
            <label htmlFor="search-duration" className={labelClass}>
              Duración
            </label>
            <select id="search-duration" name="duration" defaultValue="" className={fieldClass}>
              <option value="">Cualquiera</option>
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search-travelers" className={labelClass}>
              Viajeros
            </label>
            <input
              id="search-travelers"
              name="travelers"
              type="number"
              min={1}
              max={30}
              inputMode="numeric"
              placeholder="Cantidad"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="search-budget" className={labelClass}>
              Presupuesto
            </label>
            <select id="search-budget" name="budget" defaultValue="" className={fieldClass}>
              <option value="">Cualquiera</option>
              {budgetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className={`${buttonStyles.secondary} mt-5 h-11 w-full sm:w-auto sm:px-8`}>
          Buscar viajes
        </button>
      </form>
    </div>
  );
}
