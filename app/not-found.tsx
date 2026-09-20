import Link from "next/link";
import { buttonStyles } from "@/components/ui/buttons";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-4 py-24 sm:px-6">
      <p className="text-sm font-semibold text-travel-primary">Error 404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-travel-primary-dark sm:text-4xl">
        No encontramos esa página
      </h1>
      <p className="mt-3 max-w-xl text-travel-muted">
        Puede que el enlace esté desactualizado o que la dirección tenga un
        error. Puedes volver al inicio o explorar nuestros destinos.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={buttonStyles.secondary}>
          Ir al inicio
        </Link>
        <Link href="/destinations" className={buttonStyles.outline}>
          Ver destinos
        </Link>
      </div>
    </main>
  );
}
