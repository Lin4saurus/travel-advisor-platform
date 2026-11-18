import type { CatalogStatus } from "@/lib/supabase/types";

const styles: Record<CatalogStatus, string> = {
  published: "bg-green-100 text-green-900",
  draft: "bg-travel-accent-light text-travel-text",
  archived: "bg-travel-surface text-travel-muted ring-1 ring-travel-border",
};

const labels: Record<CatalogStatus, string> = {
  published: "Publicado",
  draft: "No publicado",
  archived: "Archivado",
};

export default function CatalogStatusBadge({ status }: { status: CatalogStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
