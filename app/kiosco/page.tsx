import Link from "next/link";
import QuoteQr from "@/components/kiosk/QuoteQr";
import SafeImage from "@/components/ui/SafeImage";
import { getCatalog } from "@/lib/catalog/read";
import { kioskHref, kioskSections, type KioskSectionId } from "@/lib/kiosk";

const sectionImages: Record<KioskSectionId, string> = {
  paquetes: "/images/categories/playa-resorts.jpg",
  destinos: "/images/destinations/bolivia/uyuni.jpg",
  experiencias: "/images/experiences/paseo-barco.jpg",
  eventos: "/images/events/festival-musica.jpg",
};

// Pantalla de inicio del kiosco: cuatro accesos grandes y el QR para cotizar un viaje a medida.
export default async function KioskHome() {
  const catalog = await getCatalog();
  const counts: Record<KioskSectionId, number> = {
    paquetes: catalog.packages.length,
    destinos: catalog.destinations.length,
    experiencias: catalog.experiences.length,
    eventos: catalog.events.length,
  };
  const sections = kioskSections.filter((section) => counts[section.id] > 0);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-travel-primary-dark">¿A dónde quieres viajar?</h1>
        <p className="mt-3 text-2xl text-travel-muted">Toca una opción para explorar nuestro catálogo.</p>
      </div>

      {/* Pantalla vertical (tótem): una columna con accesos más altos, para aprovechar la altura. */}
      <ul className="grid gap-6 sm:grid-cols-2 portrait:sm:grid-cols-1">
        {sections.map((section) => (
          <li key={section.id}>
            <Link
              href={kioskHref(section.id)}
              className="relative isolate flex h-56 items-end overflow-hidden rounded-3xl text-white shadow-md transition active:scale-[0.98] lg:h-64 portrait:sm:h-72"
            >
              <SafeImage src={sectionImages[section.id]} alt="" label={section.title} showLabel={false} sizes="50vw" eager />
              <div className="absolute inset-0 bg-gradient-to-t from-travel-primary-dark/90 via-travel-primary-dark/40 to-transparent" />
              <div className="relative p-7">
                <h2 className="text-4xl font-semibold">{section.title}</h2>
                <p className="mt-1 text-xl text-white/90">
                  {section.subtitle} · {counts[section.id]}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <QuoteQr path="/quote" title="¿Ya sabes lo que buscas? Cotiza tu viaje a medida" />
    </div>
  );
}
