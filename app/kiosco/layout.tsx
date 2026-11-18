import type { Metadata } from "next";
import KioskBar from "@/components/kiosk/KioskBar";
import KioskIdle from "@/components/kiosk/KioskIdle";

// Modo kiosco: pantalla táctil para la agencia (ver lib/kiosk.ts). Fuera de buscadores: es una herramienta del
// local, no contenido para indexar (el contenido ya está en las páginas públicas).
export const metadata: Metadata = {
  title: { default: "Kiosco", template: "%s · Kiosco | Universal Tours" },
  robots: { index: false, follow: false },
};

// Lee el catálogo de Supabase y el host de la petición (para los QR): siempre en el momento.
export const dynamic = "force-dynamic";

export default function KioskLayout({ children }: LayoutProps<"/kiosco">) {
  return (
    // `select-none`: en una pantalla táctil, un toque largo no debe seleccionar texto ni abrir menús.
    <div className="flex min-h-screen flex-1 flex-col bg-travel-surface text-lg select-none">
      <KioskBar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
      <KioskIdle />
    </div>
  );
}
