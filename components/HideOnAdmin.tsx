"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// El panel admin (`/admin/*`) tiene su propio encabezado: oculta el Header/Footer públicos del layout raíz.
// Recibe los componentes ya renderizados como `children` (el Footer sigue siendo un Server Component).
export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return children;
}
