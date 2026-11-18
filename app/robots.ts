import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// /robots.txt: todo el sitio público es indexable salvo el panel y el modo kiosco (herramienta del local, con el
// mismo contenido que las páginas públicas). Ambos llevan además `noindex` en su metadata.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/kiosco"] },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
