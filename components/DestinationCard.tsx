import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import type { Destination } from "@/data/destinations";

type DestinationCardProps = {
  destination: Destination;
  variant?: "default" | "compact";
  // Texto adicional bajo la descripción (p. ej. "Consulta fechas recomendadas").
  note?: string;
};

export default function DestinationCard({
  destination,
  variant = "default",
  note,
}: DestinationCardProps) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block h-full overflow-hidden rounded-2xl border border-travel-border bg-travel-background transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage
          src={destination.image}
          alt={`Imagen ilustrativa de ${destination.name}`}
          label={destination.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-travel-primary-dark">{destination.name}</h3>
        <p className="text-sm text-travel-muted">{destination.location}</p>
        {variant === "default" && (
          <p className="mt-2 text-sm text-travel-text">{destination.summary}</p>
        )}
        {note && (
          <p className="mt-2 text-sm font-medium text-travel-primary">{note}</p>
        )}
      </div>
    </Link>
  );
}
