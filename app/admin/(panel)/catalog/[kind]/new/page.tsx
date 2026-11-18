import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogForm from "@/components/admin/CatalogForm";
import { requireAdmin } from "@/lib/admin/auth";
import { listCatalogItems } from "@/lib/admin/catalog";
import { emptyValues, kindLabels } from "@/lib/catalog/forms";
import { isCatalogKind } from "@/lib/catalog/normalize";

export const metadata: Metadata = { title: "Nuevo elemento" };

export default async function AdminCatalogNewPage(props: PageProps<"/admin/catalog/[kind]/new">) {
  const { kind } = await props.params;
  await requireAdmin(`/admin/catalog/${encodeURIComponent(kind)}/new`);
  if (!isCatalogKind(kind)) notFound();

  const labels = kindLabels[kind];
  const destinations = kind === "packages" ? ((await listCatalogItems("destinations", "active")) ?? []) : [];

  return (
    <div className="space-y-6">
      <nav aria-label="Migas de pan" className="text-sm">
        <Link href={`/admin/catalog/${kind}`} className="text-travel-primary underline-offset-4 hover:underline">
          ← {labels.plural}
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-travel-primary-dark sm:text-3xl">
        Nuevo {labels.singular}
      </h1>
      <CatalogForm
        kind={kind}
        initialValues={emptyValues(kind)}
        destinationOptions={destinations.map((item) => ({ value: item.slug, label: item.data.name }))}
      />
    </div>
  );
}
