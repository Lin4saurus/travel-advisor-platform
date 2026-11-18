import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// /robots.txt: todo el sitio público es indexable salvo el panel. El panel además lleva `noindex` (metadata y
// cabecera `X-Robots-Tag` en proxy.ts), que es lo que de verdad lo saca de los buscadores.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin"] },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
