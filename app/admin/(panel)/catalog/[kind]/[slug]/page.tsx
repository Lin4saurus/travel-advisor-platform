import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogStatusAction, duplicateCatalogItemAction } from "@/app/admin/catalog-actions";
import CatalogForm from "@/components/admin/CatalogForm";
import CatalogStatusBadge from "@/components/admin/CatalogStatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { CATALOG_STATUS_LABELS, getCatalogItem, isCatalogStatus, listCatalogItems } from "@/lib/admin/catalog";
import { kindLabels, toFormValues } from "@/lib/catalog/forms";
import { isCatalogKind, isSlug } from "@/lib/catalog/normalize";
import { formatDateTime } from "@/lib/format";
import type { CatalogStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Editar elemento" };

const smallButton =
  "inline-flex min-h-9 items-center rounded-full border border-travel-border bg-travel-background px-4 text-sm font-medium text-travel-text hover:border-travel-primary";

const savedMessages: Record<string, string> = {
  "1": "Cambios guardados.",
  created: "Creado correctamente.",
  duplicated: "Copia creada (no publicada). Revisa el nombre y el identificador antes de publicarla.",
};

export default async function AdminCatalogEditPage(props: PageProps<"/admin/catalog/[kind]/[slug]">) {
  const { kind, slug } = await props.params;
  const search = await props.searchParams;
  await requireAdmin(`/admin/catalog/${encodeURIComponent(kind)}/${encodeURIComponent(slug)}`);
  if (!isCatalogKind(kind) || !isSlug(slug)) notFound();

  const item = await getCatalogItem(kind, slug);
  if (!item) notFound();
  const labels = kindLabels[kind];
  const destinations = kind === "packages" ? ((await listCatalogItems("destinations", "active")) ?? []) : [];

  const saved = typeof search.saved === "string" ? savedMessages[search.saved] : undefined;
  const statusChanged = isCatalogStatus(search.status) ? search.status : null;
  const failed = search.error === "1";
  // Eventos no tienen página de detalle propia: se enlaza a la lista.
  const publicHref = kind === "events" ? labels.publicPath : `${labels.publicPath}/${slug}`;

  const statusButtons: { status: CatalogStatus; label: string }[] =
    item.status === "published"
      ? [{ status: "draft", label: "Despublicar" }, { status: "archived", label: "Archivar" }]
      : item.status === "draft"
        ? [{ status: "published", label: "Publicar" }, { status: "archived", label: "Archivar" }]
        : [{ status: "draft", label: "Restaurar (sin publicar)" }];

  return (
    <div className="space-y-6">
      <nav aria-label="Migas de pan" className="text-sm">
        <Link href={`/admin/catalog/${kind}`} className="text-travel-primary underline-offset-4 hover:underline">
          ← {labels.plural}
        </Link>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-travel-primary-dark sm:text-3xl">{item.data.name}</h1>
          <p className="mt-1 text-sm text-travel-muted">Última modificación: {formatDateTime(item.updatedAt)}</p>
        </div>
        <CatalogStatusBadge status={item.status} />
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {saved && <span className="text-travel-success">{saved}</span>}
        {statusChanged && (
          <span className="text-travel-success">Estado cambiado a «{CATALOG_STATUS_LABELS[statusChanged]}».</span>
        )}
        {failed && <span className="text-travel-danger">No se pudo completar la acción. Inténtalo de nuevo.</span>}
      </p>

      <section aria-label="Acciones" className="flex flex-wrap items-center gap-2 rounded-xl border border-travel-border bg-travel-background p-4">
        {statusButtons.map((button) => (
          <form key={button.status} action={catalogStatusAction}>
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="status" value={button.status} />
            <button type="submit" className={smallButton}>
              {button.label}
            </button>
          </form>
        ))}
        <form action={duplicateCatalogItemAction}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="slug" value={slug} />
          <button type="submit" className={smallButton}>
            Duplicar
          </button>
        </form>
        {item.status === "published" && (
          <Link href={publicHref} target="_blank" rel="noopener" className="ml-auto text-sm font-medium text-travel-primary underline-offset-4 hover:underline">
            Ver en el sitio ↗
          </Link>
        )}
      </section>

      {/* `key`: tras guardar, el formulario se vuelve a montar con los datos recién guardados (si no, conservaría
          el estado inicial de la primera carga). */}
      <CatalogForm
        key={item.updatedAt}
        kind={kind}
        originalSlug={slug}
        initialValues={toFormValues(kind, item.data, item.sortOrder)}
        destinationOptions={destinations.map((entry) => ({ value: entry.slug, label: entry.data.name }))}
      />
    </div>
  );
}
