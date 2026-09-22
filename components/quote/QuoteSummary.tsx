import type { SummarySection } from "@/lib/quote";

// Todo lo que la persona eligió, por paso. Con `onEdit` cada sección trae un botón para volver a ese paso.
export default function QuoteSummary({
  sections,
  onEdit,
}: {
  sections: SummarySection[];
  onEdit?: (section: SummarySection) => void;
}) {
  return (
    <div className="divide-y divide-travel-border rounded-xl border border-travel-border">
      {sections.map((section) => (
        <section key={section.step} aria-labelledby={`summary-${section.step}`} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 id={`summary-${section.step}`} className="font-semibold text-travel-primary-dark">
              {section.title}
            </h3>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(section)}
                aria-label={`Editar ${section.title.toLowerCase()}`}
                className="-my-1.5 min-h-9 shrink-0 rounded-sm px-2 text-sm font-semibold text-travel-primary underline-offset-4 hover:underline"
              >
                Editar
              </button>
            )}
          </div>
          <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[12rem_1fr]">
            {section.rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-travel-muted">{row.label}</dt>
                <dd className="break-words text-travel-text">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
