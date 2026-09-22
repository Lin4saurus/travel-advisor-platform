import DestinationCard from "@/components/DestinationCard";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { destinations } from "@/data/destinations";

const gridClass = "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4";

export default function DestinationsPage() {
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
        <ul className={gridClass}>
          {international.map((destination) => (
            <li key={destination.slug}>
              <DestinationCard destination={destination} />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="nacionales"
        title="Destinos nacionales"
        description="Bolivia: salares, selva, valles y ciudades con historia."
        action={{ label: "Ver viajes por Bolivia", href: "/destinations/bolivia" }}
        tone="sand"
      >
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
      </Section>
    </main>
  );
}
