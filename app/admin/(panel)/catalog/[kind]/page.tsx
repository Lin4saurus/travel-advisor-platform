import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogStatusBadge from "@/components/admin/CatalogStatusBadge";
import DataUnavailable from "@/components/admin/DataUnavailable";
import { buttonStyles } from "@/components/ui/buttons";
import { requireAdmin } from "@/lib/admin/auth";
import { listCatalogItems } from "@/lib/admin/catalog";
import { kindLabels } from "@/lib/catalog/forms";
import { isCatalogKind } from "@/lib/catalog/normalize";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata(props: PageProps<"/admin/catalog/[kind]">): Promise<Metadata> {
  const { kind } = await props.params;
  return { title: isCatalogKind(kind) ? kindLabels[kind].plural : "Catálogo" };
}

export default async function AdminCatalogListPage(props: PageProps<"/admin/catalog/[kind]">) {
  const { kind } = await props.params;
  const { view: viewRaw } = await props.searchParams;
  const view = viewRaw === "archived" ? "archived" : "active";
  await requireAdmin(`/admin/catalog/${encodeURIComponent(kind)}${view === "archived" ? "?view=archived" : ""}`);
  if (!isCatalogKind(kind)) notFound();

  const labels = kindLabels[kind];
  const items = await listCatalogItems(kind, view);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-travel-primary-dark sm:text-3xl">{labels.plural}</h1>
          <p className="mt-1 text-travel-muted">
            {view === "archived"
              ? `${labels.plural} archivados: no se muestran en el sitio.`
              : `Lo publicado aparece en el sitio; lo no publicado queda guardado aquí.`}
          </p>
        </div>
        <Link href={`/admin/catalog/${kind}/new`} className={buttonStyles.secondary}>
          Nuevo {labels.singular}
        </Link>
      </div>

      <nav aria-label="Vista" className="flex gap-2 text-sm">
        {(["active", "archived"] as const).map((option) => (
          <Link
            key={option}
            href={option === "archived" ? `/admin/catalog/${kind}?view=archived` : `/admin/catalog/${kind}`}
            aria-current={view === option ? "page" : undefined}
            className={`inline-flex min-h-9 items-center rounded-full px-4 font-medium ${
              view === option ? "bg-travel-primary text-white" : "border border-travel-border bg-travel-background"
            }`}
          >
            {option === "archived" ? "Archivados" : "Activos"}
          </Link>
        ))}
      </nav>

      <h2 className="sr-only">Resultados</h2>
      {items === null ? (
        <DataUnavailable what={`los ${labels.plural.toLowerCase()}`} />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-travel-border bg-travel-background p-6 text-center text-travel-muted">
          {view === "archived" ? "No hay nada archivado." : `Todavía no hay ${labels.plural.toLowerCase()}.`}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-travel-border bg-travel-background">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">{labels.plural}</caption>
            <thead className="border-b border-travel-border bg-travel-surface text-xs tracking-wide text-travel-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
                <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                <th scope="col" className="px-4 py-3 font-semibold">Orden</th>
                <th scope="col" className="px-4 py-3 font-semibold">Modificado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-travel-border">
              {items.map((item) => (
                <tr key={item.id} className="align-top hover:bg-travel-surface/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/catalog/${kind}/${item.slug}`}
                      className="font-medium text-travel-primary underline-offset-4 hover:underline"
                    >
                      {item.data.name}
                    </Link>
                    <div className="font-mono text-xs text-travel-muted">{item.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <CatalogStatusBadge status={item.status} />
                      {"featured" in item.data && item.data.featured && (
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-travel-primary-dark">
                          Destacado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-travel-muted">{item.sortOrder}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-travel-muted">{formatDateTime(item.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
