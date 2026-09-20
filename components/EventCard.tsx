import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";
import type { TravelEvent } from "@/data/events";

export default function EventCard({ event }: { event: TravelEvent }) {
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
          {event.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-travel-primary-dark">{event.name}</h3>
        <p className="mt-1 text-sm text-travel-muted">
          {event.city ?? "Ciudad a consultar"} · {event.status}
        </p>
        <p className="mt-3 text-sm text-travel-text">{event.summary}</p>
        <div className="mt-auto pt-4">
          <Link href="/contact" className={buttonStyles.outline}>
            Solicitar información
          </Link>
        </div>
      </div>
    </article>
  );
}
