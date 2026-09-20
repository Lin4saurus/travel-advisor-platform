import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";
import { availabilityLabels, includeLabels } from "@/config/packages";
import type { TravelPackage } from "@/data/packages";
import { formatDuration, formatPrice } from "@/lib/format";

export default function PackageCard({ pkg }: { pkg: TravelPackage }) {
  // Solo se listan los servicios confirmados (true); los desconocidos (null) no se afirman ni se niegan.
  const included = (Object.keys(includeLabels) as Array<keyof typeof includeLabels>)
    .filter((key) => pkg.includes[key] === true)
    .map((key) => includeLabels[key]);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-travel-border bg-travel-background">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage
          src={pkg.image}
          alt={`Imagen ilustrativa del paquete ${pkg.name}`}
          label={pkg.name}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        {pkg.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-travel-accent px-3 py-1 text-xs font-semibold text-travel-text">
            {pkg.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-travel-primary-dark">{pkg.name}</h3>
        <p className="mt-1 text-sm text-travel-muted">
          {pkg.destination} · {formatDuration(pkg.durationDays)}
        </p>
        <p className="mt-3 text-sm text-travel-text">{pkg.summary}</p>
        {(pkg.board || included.length > 0 || pkg.availability) && (
          <ul className="mt-3 space-y-1 text-sm text-travel-text">
            {pkg.board && (
              <li>
                <span className="font-medium">Régimen:</span> {pkg.board}
              </li>
            )}
            {included.length > 0 && (
              <li>
                <span className="font-medium">Incluye:</span> {included.join(", ")}
              </li>
            )}
            {pkg.availability && (
              <li>
                <span className="font-medium">Disponibilidad:</span>{" "}
                {availabilityLabels[pkg.availability]}
              </li>
            )}
          </ul>
        )}
        <p className="mt-4 font-semibold text-travel-text">
          {pkg.price ? `Desde ${formatPrice(pkg.price)}` : "Consultar precio"}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Link href={`/packages/${pkg.slug}`} className={buttonStyles.secondary}>
            Ver paquete
          </Link>
          <Link href={`/quote?package=${pkg.slug}`} className={buttonStyles.outline}>
            Cotizar
          </Link>
        </div>
      </div>
    </article>
  );
}
