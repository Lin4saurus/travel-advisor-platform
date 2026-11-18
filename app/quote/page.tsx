import PageHeader from "@/components/PageHeader";
import QuoteStepper from "@/components/quote/QuoteStepper";
import { quoteSteps } from "@/config/quote";
import { buildCatalog, parseQuoteEntry } from "@/lib/quote-entry";
import { hasQuery, pageMetadata } from "@/lib/seo";

// Con parámetros (formulario precargado desde un paquete, una búsqueda…) es la misma página: sin indexar.
export async function generateMetadata(props: PageProps<"/quote">) {
  return pageMetadata({
    title: "Cotiza tu viaje",
    description: "Cuéntanos tu destino, fechas, viajeros y presupuesto, y preparamos una propuesta de viaje a tu medida.",
    path: "/quote",
    noindex: hasQuery(await props.searchParams),
  });
}

// Dinámica: lee los parámetros de la URL (`searchParams`) para precargar el formulario. Contrato en `lib/quote-entry.ts`.
export default async function QuotePage(props: PageProps<"/quote">) {
  const catalog = await buildCatalog();
  const { state, notices, prefilled } = parseQuoteEntry(await props.searchParams, catalog);

  return (
    <main className="flex-1">
      <PageHeader
        title="Cotiza tu viaje"
        description={`Cuéntanos qué necesitas en ${quoteSteps.length} pasos y preparamos una propuesta a tu medida.`}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        {prefilled && (
          <p className="mb-4 rounded-lg bg-travel-surface px-4 py-3 text-sm text-travel-text">
            Precargamos algunos datos desde tu selección. Puedes cambiarlos en cada paso.
          </p>
        )}
        {notices.map((notice) => (
          <p key={notice} className="mb-4 rounded-lg bg-travel-accent-light px-4 py-3 text-sm text-travel-text">
            {notice}
          </p>
        ))}
        <noscript>
          <p className="mb-4 rounded-lg bg-travel-accent-light px-4 py-3 text-sm text-travel-text">
            Este formulario necesita JavaScript para funcionar. Actívalo en tu navegador e inténtalo de nuevo.
          </p>
        </noscript>
        <QuoteStepper catalog={catalog} initialState={state} />
      </div>
    </main>
  );
}
