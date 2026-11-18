// Formatos de presentación compartidos (tarjetas y detalle de paquete).

export function formatPrice({ amount, currency }: { amount: number; currency: string }) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(days: number | null) {
  if (days === null) return "Duración a consultar";
  return `${days} ${days === 1 ? "día" : "días"}`;
}

// "2026-11-10" → "10 de noviembre de 2026" (en UTC para que la fecha no cambie según la zona horaria).
export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

// Fecha y hora de un `timestamptz` (p. ej. `created_at`) en la hora de Bolivia, donde opera la agencia:
// "18 nov 2026, 14:05". Se fija la zona para que el servidor y el navegador muestren lo mismo.
export function formatDateTime(isoTimestamp: string) {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/La_Paz",
  }).format(date);
}
