import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { catalogNames } from "@/lib/admin/catalog";
import { catalogItemName, requestTypeLabel } from "@/lib/admin/labels";
import { formatDateTime } from "@/lib/format";
import type { TravelQuote } from "@/lib/supabase/types";

// Tabla de cotizaciones (resumen y listado). En pantallas angostas se desplaza horizontalmente dentro de su
// contenedor, nunca la página entera.
export default async function QuoteTable({ quotes, caption }: { quotes: TravelQuote[]; caption: string }) {
  const names = await catalogNames();
  return (
    <div className="overflow-x-auto rounded-xl border border-travel-border bg-travel-background">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-travel-border bg-travel-surface text-xs tracking-wide text-travel-muted uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Referencia</th>
            <th scope="col" className="px-4 py-3 font-semibold">Recibida</th>
            <th scope="col" className="px-4 py-3 font-semibold">Cliente</th>
            <th scope="col" className="px-4 py-3 font-semibold">Solicitud</th>
            <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-travel-border">
          {quotes.map((quote) => {
            const item = catalogItemName(quote.requestType, quote.itemSlug, names);
            return (
              <tr key={quote.id} className="align-top hover:bg-travel-surface/60">
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  <Link
                    href={`/admin/quotes/${quote.id}`}
                    className="text-travel-primary underline-offset-4 hover:underline"
                  >
                    {quote.reference}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-travel-muted">{formatDateTime(quote.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-travel-text">{quote.contactName}</div>
                  <div className="break-all text-travel-muted">{quote.contactEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{requestTypeLabel(quote.requestType)}</div>
                  {(item || quote.destination) && (
                    <div className="text-travel-muted">{item ?? quote.destination}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={quote.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
