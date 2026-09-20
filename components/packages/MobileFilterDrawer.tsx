"use client";

import { useEffect, useRef, type ReactNode } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)"; // desde `lg` los filtros están en la barra lateral

type MobileFilterDrawerProps = {
  // Cantidad de filtros activos (se muestra en el botón).
  activeCount: number;
  children: ReactNode;
};

// Cajón de filtros para móvil sobre <dialog> nativo: el navegador se encarga de contener el foco,
// inertizar el resto de la página, cerrar con Escape y devolver el foco al botón que lo abrió.
export default function MobileFilterDrawer({ activeCount, children }: MobileFilterDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const restoreScroll = () => {
      document.body.style.overflow = previousOverflow.current;
    };
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialog.close();
    };

    dialog.addEventListener("close", restoreScroll);
    query.addEventListener("change", onChange);
    return () => {
      dialog.removeEventListener("close", restoreScroll);
      query.removeEventListener("change", onChange);
      if (dialog.open) restoreScroll();
    };
  }, []);

  function open() {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="inline-flex h-11 items-center gap-2 rounded-full border border-travel-primary px-5 text-sm font-semibold text-travel-primary hover:bg-travel-surface lg:hidden"
      >
        Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="mobile-filters-title"
        // Clic fuera del panel (sobre el fondo oscuro) cierra el cajón.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-full max-w-sm flex-col bg-travel-background p-0 shadow-xl backdrop:bg-black/50 open:flex"
      >
        <div className="flex items-center justify-between border-b border-travel-border px-4 py-3">
          <h2 id="mobile-filters-title" className="text-lg font-semibold text-travel-primary-dark">
            Filtros
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar filtros"
            className="inline-flex size-10 items-center justify-center rounded-md text-travel-text hover:bg-travel-surface"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
      </dialog>
    </>
  );
}
