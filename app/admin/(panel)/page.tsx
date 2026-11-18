import type { Metadata } from "next";
import Link from "next/link";
import DataUnavailable from "@/components/admin/DataUnavailable";
import QuoteTable from "@/components/admin/QuoteTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { countCatalog, listCatalogItems } from "@/lib/admin/catalog";
import { countQuotesByStatus, recentQuotes } from "@/lib/admin/quotes";
import { localISODate } from "@/lib/quote";
import { QUOTE_STATUSES } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Resumen" };

// Los tres estados que piden atención del equipo van destacados arriba.
const HIGHLIGHTED = ["Nueva", "En revisión", "Propuesta enviada"] as const;

export default async function AdminDashboardPage() {
  await requireAdmin("/admin");
  const [counts, recent, catalogCounts, eventItems] = await Promise.all([
    countQuotesByStatus(),
    recentQuotes(5),
    countCatalog(),
    listCatalogItems("events", "active"),
  ]);

  const today = localISODate();
  const publishedEvents = (eventItems ?? []).filter((item) => item.status === "published").map((item) => item.data);
  const upcomingEvents = publishedEvents.filter((event) => event.date !== null && event.date >= today).length;
  const undatedEvents = publishedEvents.filter((event) => event.date === null).length;

  const draftNote = (n: number) => (n > 0 ? `${n} sin publicar` : undefined);
  const catalog = catalogCounts && [
    {
      label: "Paquetes publicados",
      value: catalogCounts.packages.published,
      href: "/admin/catalog/packages",
      note: draftNote(catalogCounts.packages.draft),
    },
    {
      label: "Destinos publicados",
      value: catalogCounts.destinations.published,
      href: "/admin/catalog/destinations",
      note: draftNote(catalogCounts.destinations.draft),
    },
    {
      label: "Experiencias publicadas",
      value: catalogCounts.experiences.published,
      href: "/admin/catalog/experiences",
      note: draftNote(catalogCounts.experiences.draft),
    },
    {
      label: "Próximos eventos",
      value: upcomingEvents,
      href: "/admin/catalog/events",
      note: undatedEvents > 0 ? `${undatedEvents} publicados con fecha por confirmar` : undefined,
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-travel-primary-dark sm:text-3xl">Resumen</h1>
        <p className="mt-1 text-travel-muted">Cotizaciones recibidas desde el formulario y estado del catálogo.</p>
      </div>

      <section aria-labelledby="quotes-metrics">
        <h2 id="quotes-metrics" className="text-lg font-semibold text-travel-text">
          Cotizaciones
        </h2>
        {counts ? (
          <>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {HIGHLIGHTED.map((status) => (
                <li key={status}>
                  <Link
                    href={`/admin/quotes?status=${encodeURIComponent(status)}`}
                    className="block rounded-xl border border-travel-border bg-travel-background p-5 transition hover:border-travel-primary"
                  >
                    <span className="text-3xl font-semibold text-travel-primary-dark">{counts[status]}</span>
                    <span className="mt-1 block text-sm text-travel-muted">{status}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Todas por estado">
              {QUOTE_STATUSES.filter((status) => !(HIGHLIGHTED as readonly string[]).includes(status)).map(
                (status) => (
                  <li key={status}>
                    <Link
                      href={`/admin/quotes?status=${encodeURIComponent(status)}`}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-travel-border bg-travel-background px-3 hover:border-travel-primary"
                    >
                      <StatusBadge status={status} />
                      <span className="font-semibold">{counts[status]}</span>
                    </Link>
                  </li>
                ),
              )}
              <li>
                <Link
                  href="/admin/quotes"
                  className="inline-flex min-h-9 items-center rounded-full px-3 font-medium text-travel-primary underline-offset-4 hover:underline"
                >
                  Total: {counts.total}
                </Link>
              </li>
            </ul>
          </>
        ) : (
          <div className="mt-4">
            <DataUnavailable what="las métricas de cotizaciones" />
          </div>
        )}
      </section>

      <section aria-labelledby="recent-quotes">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="recent-quotes" className="text-lg font-semibold text-travel-text">
            Consultas recientes
          </h2>
          <Link href="/admin/quotes" className="text-sm font-medium text-travel-primary underline-offset-4 hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="mt-4">
          {recent === null ? (
            <DataUnavailable what="las consultas recientes" />
          ) : recent.length === 0 ? (
            <p className="rounded-xl border border-dashed border-travel-border bg-travel-background p-6 text-center text-travel-muted">
              Todavía no llegó ninguna cotización.
            </p>
          ) : (
            <QuoteTable quotes={recent} caption="Las 5 cotizaciones más recientes" />
          )}
        </div>
      </section>

      <section aria-labelledby="catalog-metrics">
        <h2 id="catalog-metrics" className="text-lg font-semibold text-travel-text">
          Catálogo
        </h2>
        {catalog ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.map((entry) => (
              <li key={entry.label}>
                <Link
                  href={entry.href}
                  className="block h-full rounded-xl border border-travel-border bg-travel-background p-5 transition hover:border-travel-primary"
                >
                  <span className="text-3xl font-semibold text-travel-primary-dark">{entry.value}</span>
                  <span className="mt-1 block text-sm text-travel-muted">{entry.label}</span>
                  {entry.note && <span className="mt-1 block text-xs text-travel-muted">{entry.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <DataUnavailable what="el resumen del catálogo" />
          </div>
        )}
      </section>
    </div>
  );
}
