"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Secciones con su propio marco que no llevan el Header/Footer públicos del layout raíz: el panel admin
// (`/admin/*`) y el modo kiosco (`/kiosco/*`). Recibe los componentes ya renderizados como `children` (el Footer
// sigue siendo un Server Component).
const OWN_CHROME = ["/admin", "/kiosco"];

export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (OWN_CHROME.some((base) => pathname === base || pathname.startsWith(`${base}/`))) return null;
  return children;
}
