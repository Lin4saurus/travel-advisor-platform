import type { Metadata } from "next";
import Link from "next/link";
import DataUnavailable from "@/components/admin/DataUnavailable";
import QuoteTable from "@/components/admin/QuoteTable";
import { buttonStyles } from "@/components/ui/buttons";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { requireAdmin } from "@/lib/admin/auth";
import { cleanSearch, listQuotes } from "@/lib/admin/quotes";
import { QUOTE_STATUSES, isQuoteStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Cotizaciones" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function quotesHref(params: { status?: string; q?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const text = search.toString();
  return text ? `/admin/quotes?${text}` : "/admin/quotes";
}

export default async function AdminQuotesPage(props: PageProps<"/admin/quotes">) {
  const raw = await props.searchParams;
  const statusRaw = first(raw.status);
  const status = isQuoteStatus(statusRaw) ? statusRaw : undefined;
  const q = cleanSearch(first(raw.q));
  const pageNumber = Number(first(raw.page));
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  await requireAdmin(quotesHref({ status, q, page }));
  const list = await listQuotes({ status, search: q, page });
  const filtered = Boolean(status || q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-travel-primary-dark sm:text-3xl">Cotizaciones</h1>
        <p className="mt-1 text-travel-muted">Solicitudes enviadas desde el formulario de cotización del sitio.</p>
      </div>

      <form
        method="get"
        action="/admin/quotes"
        role="search"
        aria-label="Filtrar cotizaciones"
        className="grid gap-4 rounded-xl border border-travel-border bg-travel-background p-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
      >
        <div>
          <label htmlFor="quotes-q" className={labelClass}>
            Buscar
          </label>
          <input
            id="quotes-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Referencia, nombre, correo o destino"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="quotes-status" className={labelClass}>
            Estado
          </label>
          <select id="quotes-status" name="status" defaultValue={status ?? ""} className={fieldClass}>
            <option value="">Todos</option>
            {QUOTE_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={buttonStyles.secondary}>
            Filtrar
          </button>
          {filtered && (
            <Link href="/admin/quotes" className={buttonStyles.outline}>
              Limpiar
            </Link>
          )}
        </div>
      </form>

      <h2 className="sr-only">Resultados</h2>
      {list === null ? (
        <DataUnavailable what="las cotizaciones" />
      ) : list.quotes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-travel-border bg-travel-background p-6 text-center text-travel-muted">
          {filtered
            ? "Ninguna cotización coincide con estos filtros."
            : page > 1
              ? "No hay más cotizaciones en esta página."
              : "Todavía no llegó ninguna cotización."}
        </p>
      ) : (
        <>
          <p className="text-sm text-travel-muted" aria-live="polite">
            {list.total === 1 ? "1 cotización" : `${list.total} cotizaciones`}
            {list.pageCount > 1 && ` · página ${list.page} de ${list.pageCount}`}
          </p>
          <QuoteTable quotes={list.quotes} caption="Cotizaciones, de la más reciente a la más antigua" />
          {list.pageCount > 1 && (
            <nav aria-label="Paginación" className="flex items-center justify-between gap-4">
              {list.page > 1 ? (
                <Link href={quotesHref({ status, q, page: list.page - 1 })} className={buttonStyles.outline}>
                  Anterior
                </Link>
              ) : (
                <span />
              )}
              {list.page < list.pageCount && (
                <Link href={quotesHref({ status, q, page: list.page + 1 })} className={buttonStyles.outline}>
                  Siguiente
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
