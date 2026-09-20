import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";
import { availabilityLabels } from "@/config/packages";
import type { Experience } from "@/data/experiences";

export default function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-travel-border bg-travel-background">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage
          src={experience.image}
          alt={`Imagen ilustrativa de ${experience.name}`}
          label={experience.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-travel-primary-dark">{experience.name}</h3>
        <p className="mt-1 text-sm text-travel-muted">
          {experience.location ?? "Ciudad a consultar"} · {experience.duration ?? "Duración a consultar"}
        </p>
        <p className="mt-3 text-sm text-travel-text">{experience.summary}</p>
        {/* Solo lo confirmado: sin dato no se muestra la línea. */}
        {(experience.availability || experience.includes.length > 0) && (
          <ul className="mt-3 space-y-1 text-sm text-travel-text">
            {experience.availability && (
              <li>
                <span className="font-medium">Disponibilidad:</span>{" "}
                {availabilityLabels[experience.availability]}
              </li>
            )}
            {experience.includes.length > 0 && (
              <li>
                <span className="font-medium">Incluye:</span> {experience.includes.join(", ")}
              </li>
            )}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Link href={`/experiences/${experience.slug}`} className={buttonStyles.secondary}>
            Ver experiencia
          </Link>
          <Link href={`/quote?experience=${experience.slug}`} className={buttonStyles.outline}>
            Consultar
          </Link>
        </div>
      </div>
    </article>
  );
}
