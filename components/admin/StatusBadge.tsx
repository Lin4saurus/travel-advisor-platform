import type { QuoteStatus } from "@/lib/supabase/types";

// Colores de cada estado (texto oscuro sobre fondo claro: contraste AA).
const styles: Record<QuoteStatus, string> = {
  Nueva: "bg-travel-accent-light text-travel-text",
  "En revisión": "bg-blue-100 text-travel-primary-dark",
  Contactado: "bg-cyan-100 text-cyan-900",
  "Propuesta enviada": "bg-indigo-100 text-indigo-900",
  Confirmada: "bg-green-100 text-green-900",
  Cerrada: "bg-travel-surface text-travel-muted ring-1 ring-travel-border",
  Cancelada: "bg-red-100 text-red-900",
};

export default function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
}
