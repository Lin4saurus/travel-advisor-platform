import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";
import { eventStatusLabels } from "@/config/events";
import { eventCategories, type TravelEvent } from "@/data/events";
import { formatDate } from "@/lib/format";

export default function EventCard({ event }: { event: TravelEvent }) {
  const category = eventCategories.find((item) => item.slug === event.category)?.name ?? event.category;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-travel-border bg-travel-background">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage
          src={event.image}
          alt={`Imagen ilustrativa de ${event.name}`}
          label={event.name}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-travel-accent-light px-3 py-1 text-xs font-semibold text-travel-primary-dark">
          {category}
        </span>
        {event.isExample && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-travel-text">
            Ejemplo ilustrativo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-travel-primary-dark">{event.name}</h3>
        <p className="mt-1 text-sm text-travel-muted">
          {event.city ?? "Ciudad a consultar"} · {event.date ? formatDate(event.date) : "Fecha por confirmar"}
        </p>
        <p className="mt-3 text-sm text-travel-text">{event.summary}</p>
        {/* El estado sale de un catálogo cerrado y "Incluye" solo lista lo confirmado. */}
        <ul className="mt-3 space-y-1 text-sm text-travel-text">
          <li>
            <span className="font-medium">Estado:</span> {eventStatusLabels[event.status]}
          </li>
          <li>
            <span className="font-medium">Duración:</span> {event.duration ?? "A consultar"}
          </li>
          {event.includes.length > 0 && (
            <li>
              <span className="font-medium">Incluye:</span> {event.includes.join(", ")}
            </li>
          )}
        </ul>
        <div className="mt-auto pt-4">
          <Link href={`/quote?event=${event.slug}`} className={buttonStyles.outline}>
            Solicitar información
          </Link>
        </div>
      </div>
    </article>
  );
}
