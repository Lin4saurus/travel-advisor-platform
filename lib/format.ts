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
