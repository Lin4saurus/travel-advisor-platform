// SEO compartido (M13): URL pública del sitio y metadata por página (título, descripción, URL canónica, Open
// Graph, robots). Lógica pura.
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

// URL pública del sitio, para URLs absolutas (canónicas, Open Graph, sitemap). Se configura con
// `NEXT_PUBLIC_SITE_URL` (p. ej. https://tu-dominio.com) en el entorno de producción; sin ella se usa
// localhost, lo que solo sirve para desarrollo.
export function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    if (raw) return new URL(raw);
  } catch {
    console.error("[seo] NEXT_PUBLIC_SITE_URL no es una URL válida:", raw);
  }
  return new URL("http://localhost:3000");
}

export const DEFAULT_OG_IMAGE = "/images/travel-hero.jpg";

type PageMeta = {
  title: string;
  description: string;
  // Ruta canónica, siempre en minúsculas y sin parámetros (p. ej. "/packages/cartagena-caribe").
  path: string;
  image?: string;
  // `true` = no indexar pero seguir los enlaces (listados filtrados, resultados vacíos, formularios precargados).
  noindex?: boolean;
  // Usar el título tal cual, sin el sufijo " | Universal Tours" (la Home).
  absoluteTitle?: boolean;
};

export function pageMetadata({ title, description, path, image, noindex, absoluteTitle }: PageMeta): Metadata {
  const images = [{ url: image ?? DEFAULT_OG_IMAGE }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: absoluteTitle ? title : `${title} | ${siteConfig.name}`,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: "es_BO",
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((entry) => entry.url) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

// Descripción para metadata a partir de un texto largo: una sola línea, ≤ 160 caracteres, cortada en palabra.
export function metaDescription(...candidates: (string | null | undefined)[]): string {
  const text = candidates.find((value) => value && value.trim())?.replace(/\s+/g, " ").trim() ?? siteConfig.tagline;
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

// ¿Llegó algún parámetro con valor? (los vacíos no cuentan: el buscador sin JavaScript los envía vacíos).
export function hasQuery(params: Record<string, string | string[] | undefined>): boolean {
  return Object.values(params).some((value) => (Array.isArray(value) ? value.some(Boolean) : Boolean(value)));
}
