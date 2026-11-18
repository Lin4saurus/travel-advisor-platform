"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { KIOSK_BASE } from "@/lib/kiosk";

const barButton =
  "inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-travel-primary px-5 text-lg font-semibold text-travel-primary active:bg-travel-surface";

// Barra superior del kiosco: logo, "Atrás" (al nivel anterior DENTRO del kiosco, nunca a la historia del
// navegador, que podría salir del kiosco), "Inicio" y pantalla completa.
export default function KioskBar() {
  const pathname = usePathname();
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const segments = pathname.slice(KIOSK_BASE.length).split("/").filter(Boolean);
  const parent = segments.length > 1 ? `${KIOSK_BASE}/${segments[0]}` : KIOSK_BASE;
  const atHome = segments.length === 0;

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => undefined);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-travel-border bg-travel-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-6 py-3">
        <Link
          href={KIOSK_BASE}
          aria-label="Universal Tours: inicio del kiosco"
          className="mr-auto inline-flex min-h-14 items-center rounded-md pr-6"
        >
          <span className="inline-block origin-left scale-125">
            <Logo />
          </span>
        </Link>
        {!atHome && (
          <>
            <Link href={parent} className={barButton}>
              <span aria-hidden="true">←</span> Atrás
            </Link>
            <Link href={KIOSK_BASE} className={barButton}>
              <span aria-hidden="true">⌂</span> Inicio
            </Link>
          </>
        )}
        <button type="button" onClick={toggleFullscreen} className={barButton} aria-pressed={fullscreen}>
          {fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        </button>
      </div>
    </header>
  );
}
