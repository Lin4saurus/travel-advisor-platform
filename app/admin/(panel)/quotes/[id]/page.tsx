import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { changeQuoteStatusAction } from "@/app/admin/actions";
import StatusBadge from "@/components/admin/StatusBadge";
import { buttonStyles } from "@/components/ui/buttons";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { requireAdmin } from "@/lib/admin/auth";
import { catalogNames } from "@/lib/admin/catalog";
import {
  budgetProfileOf,
  budgetTierLabel,
  catalogItemName,
  contactMethodLabel,
  durationLabel,
  preferenceLabels,
  requestTypeLabel,
  serviceLabels,
} from "@/lib/admin/labels";
import { getQuote, isUuid } from "@/lib/admin/quotes";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { QUOTE_STATUSES } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Detalle de cotización" };

const EMPTY = <span className="text-travel-muted">—</span>;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-travel-muted">{label}</dt>
      <dd className="text-travel-text">{children ?? EMPTY}</dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-travel-border bg-travel-background p-5">
      <h2 className="text-lg font-semibold text-travel-text">{title}</h2>
      <dl className="mt-2 divide-y divide-travel-border">{children}</dl>
    </section>
  );
}

const list = (values: string[]) => (values.length > 0 ? values.join(", ") : null);

export default async function AdminQuoteDetailPage(props: PageProps<"/admin/quotes/[id]">) {
  const { id } = await props.params;
  const search = await props.searchParams;
  await requireAdmin(`/admin/quotes/${encodeURIComponent(id)}`);
  if (!isUuid(id)) notFound();

  const result = await getQuote(id);
  if (!result) notFound();
  const { quote, items } = result;

  const item = catalogItemName(quote.requestType, quote.itemSlug, await catalogNames());
  const profile = budgetProfileOf(quote.budgetProfile);
  const budgetAmount =
    quote.budgetAmount === null
      ? null
      : profile
        ? formatPrice({ amount: quote.budgetAmount, currency: profile.currency })
        : String(quote.budgetAmount);
  const saved = search.saved === "1";
  const failed = search.error === "1";

  return (
    <div className="space-y-6">
      <nav aria-label="Migas de pan" className="text-sm">
        <Link href="/admin/quotes" className="text-travel-primary underline-offset-4 hover:underline">
          ← Cotizaciones
        </Link>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-travel-primary-dark sm:text-3xl">
            {quote.reference}
          </h1>
          <p className="mt-1 text-travel-muted">
            Recibida el {formatDateTime(quote.createdAt)}
            {quote.updatedAt !== quote.createdAt && ` · última modificación ${formatDateTime(quote.updatedAt)}`}
          </p>
        </div>
        <StatusBadge status={quote.status} />
      </div>

      <section
        aria-labelledby="status-heading"
        className="rounded-xl border border-travel-border bg-travel-background p-5"
      >
        <h2 id="status-heading" className="text-lg font-semibold text-travel-text">
          Estado
        </h2>
        <form action={changeQuoteStatusAction} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={quote.id} />
          <div className="w-full sm:w-64">
            <label htmlFor="quote-status" className={labelClass}>
              Cambiar a
            </label>
            <select id="quote-status" name="status" defaultValue={quote.status} className={fieldClass}>
              {QUOTE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={buttonStyles.secondary}>
            Guardar estado
          </button>
        </form>
        <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
          {saved && <span className="text-travel-success">Estado guardado.</span>}
          {failed && (
            <span className="text-travel-danger">No se pudo guardar el estado. Inténtalo de nuevo.</span>
          )}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Contacto">
          <Row label="Nombre">{quote.contactName}</Row>
          <Row label="Correo">
            <a href={`mailto:${quote.contactEmail}`} className="break-all text-travel-primary underline-offset-4 hover:underline">
              {quote.contactEmail}
            </a>
          </Row>
          <Row label="Teléfono">
            <a href={`tel:${quote.contactPhone.replace(/[^\d+]/g, "")}`} className="text-travel-primary underline-offset-4 hover:underline">
              {quote.contactPhone}
            </a>
          </Row>
          <Row label="Prefiere">{contactMethodLabel(quote.contactMethod)}</Row>
          <Row label="Aceptó privacidad">{quote.acceptPrivacy ? "Sí" : "No"}</Row>
        </Card>

        <Card title="Solicitud">
          <Row label="Tipo">{requestTypeLabel(quote.requestType)}</Row>
          {item && <Row label="Elemento del catálogo">{item}</Row>}
          <Row label="Destino">
            {quote.destination}
            {quote.needsSuggestions && (
              <span className="block text-sm text-travel-muted">Pide sugerencias de destino</span>
            )}
          </Row>
          {items.length > 0 && (
            <Row label="Ítems registrados">
              <ul className="list-inside list-disc">
                {items.map((entry) => (
                  <li key={entry.id}>
                    {entry.itemName} <span className="text-travel-muted">({entry.itemType})</span>
                  </li>
                ))}
              </ul>
            </Row>
          )}
        </Card>

        <Card title="Fechas y viajeros">
          <Row label="Salida">{quote.departureDate ? formatDate(quote.departureDate) : null}</Row>
          <Row label="Regreso">{quote.returnDate ? formatDate(quote.returnDate) : null}</Row>
          <Row label="Fechas flexibles">{quote.flexibleDates ? "Sí" : "No"}</Row>
          <Row label="Duración">{durationLabel(quote.duration)}</Row>
          <Row label="Adultos">{quote.adults}</Row>
          <Row label="Niños">
            {quote.children}
            {quote.childrenAges.length > 0 && (
              <span className="text-travel-muted">
                {" "}
                (edades: {quote.childrenAges.join(", ")})
              </span>
            )}
          </Row>
        </Card>

        <Card title="Preferencias y presupuesto">
          <Row label="Tipo de viaje">{list(preferenceLabels(quote.preferences))}</Row>
          <Row label="Servicios">{list(serviceLabels(quote.services))}</Row>
          <Row label="Moneda">{profile?.label ?? quote.budgetProfile}</Row>
          <Row label="Rango">{budgetTierLabel(quote.budgetTier)}</Row>
          <Row label="Monto indicado">{budgetAmount}</Row>
        </Card>
      </div>

      <section className="rounded-xl border border-travel-border bg-travel-background p-5">
        <h2 className="text-lg font-semibold text-travel-text">Comentarios del cliente</h2>
        {quote.notes ? (
          <p className="mt-2 whitespace-pre-line text-travel-text">{quote.notes}</p>
        ) : (
          <p className="mt-2 text-travel-muted">Sin comentarios.</p>
        )}
      </section>
    </div>
  );
}
