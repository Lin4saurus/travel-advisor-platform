import NationalOverview from "@/components/destinations/NationalOverview";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Viajes nacionales: Bolivia",
  description: "Salares, selva, valles y ciudades con historia: destinos y paquetes para viajar por Bolivia.",
  path: "/destinations/bolivia",
  image: "/images/destinations/bolivia/uyuni.jpg",
});

// Ver `revalidate` en app/page.tsx.
export const revalidate = 300;

export default function BoliviaPage() {
  return <NationalOverview />;
}
