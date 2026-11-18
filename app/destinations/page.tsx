import Link from "next/link";
import DestinationCard from "@/components/DestinationCard";
import { buttonStyles } from "@/components/ui/buttons";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { getCatalog } from "@/lib/catalog/read";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Destinos",
  description: "Explora destinos internacionales y nacionales para tu próximo viaje: playas, ciudades, naturaleza y Bolivia.",
  path: "/destinations",
});

// Ver `revalidate` en app/page.tsx.
export const revalidate = 300;

const gridClass = "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4";

// Catálogo vacío (M13): todo despublicado desde el panel, o todavía sin cargar.
function EmptyList() {
  return (
    <div className="rounded-2xl border border-travel-border bg-travel-background p-8 text-center">
      <p className="text-travel-muted">Estamos actualizando estos destinos. Mientras tanto, cuéntanos a dónde quieres ir.</p>
      <Link href="/quote" className={`${buttonStyles.primary} mt-4`}>
        Cotizar mi viaje
      </Link>
    </div>
  );
}

export default async function DestinationsPage() {
  const { destinations } = await getCatalog();
  const international = destinations.filter((d) => d.scope === "international");
  const national = destinations.filter((d) => d.scope === "national");

  return (
    <main className="flex-1">
      <PageHeader
        title="Destinos"
        description="Explora destinos internacionales y nacionales para tu próximo viaje."
      />

      <Section
        id="internacionales"
        title="Destinos internacionales"
        description="Ciudades, playas y lugares emblemáticos alrededor del mundo."
      >
        {international.length > 0 ? (
          <ul className={gridClass}>
            {international.map((destination) => (
              <li key={destination.slug}>
                <DestinationCard destination={destination} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyList />
        )}
      </Section>

      <Section
        id="nacionales"
        title="Destinos nacionales"
        description="Bolivia: salares, selva, valles y ciudades con historia."
        action={{ label: "Ver viajes por Bolivia", href: "/destinations/bolivia" }}
        tone="sand"
      >
        {national.length > 0 ? (
          <ul className={gridClass}>
            {national.map((destination) => (
              <li key={destination.slug}>
                <DestinationCard
                  destination={destination}
                  note="Consulta fechas recomendadas"
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyList />
        )}
      </Section>
    </main>
  );
}
