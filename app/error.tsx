"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/buttons";

// Error inesperado en una página (M13). Mensaje propio, sin detalle técnico: en producción Next solo manda un
// identificador (`digest`) que coincide con el log del servidor; se muestra para poder reportarlo.
// `retry` (estable desde Next 16.3) vuelve a pedir y renderizar la página.
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-4 py-24 sm:px-6">
      <p className="text-sm font-semibold text-travel-primary">Algo salió mal</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-travel-primary-dark sm:text-4xl">
        No pudimos mostrar esta página
      </h1>
      <p role="alert" className="mt-3 max-w-xl text-travel-muted">
        Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
      </p>
      {error.digest && <p className="mt-2 text-xs text-travel-muted">Código del error: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={buttonStyles.secondary}>
          Intentar de nuevo
        </button>
        <Link href="/" className={buttonStyles.outline}>
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
