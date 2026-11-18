import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog/read";
import { siteUrl } from "@/lib/seo";

// /sitemap.xml: páginas fijas + cada destino, paquete y experiencia publicados (los eventos no tienen página
// propia). Se regenera como las demás páginas que leen el catálogo.
export const revalidate = 300;

const STATIC_PATHS = [
  "/",
  "/destinations",
  "/destinations/bolivia",
  "/packages",
  "/experiences",
  "/events",
  "/about",
  "/contact",
  "/quote",
  "/booking-info",
  "/terms",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { destinations, packages, experiences } = await getCatalog();
  const paths = [
    ...STATIC_PATHS,
    ...destinations.map((item) => `/destinations/${item.slug}`),
    ...packages.map((item) => `/packages/${item.slug}`),
    ...experiences.map((item) => `/experiences/${item.slug}`),
  ];
  // Sin `lastModified`: no hay una fecha de modificación real por página y una inventada no aporta.
  return [...new Set(paths)].map((path) => ({ url: new URL(path, base).toString() }));
}
