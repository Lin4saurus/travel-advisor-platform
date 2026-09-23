import { paymentMethods } from "@/config/payments";

// Formas de pago (M11). Configurable desde config/payments.ts; sin logos de bancos hasta tener autorización
// (solo texto). Si todavía no hay ninguna confirmada, lo dice en vez de inventar una lista.
export default function PaymentMethods() {
  if (paymentMethods.length === 0) {
    return (
      <p className="text-travel-muted">
        Todavía no tenemos formas de pago publicadas aquí. Te las confirmamos junto con tu cotización.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {paymentMethods.map((method) => (
        <li key={method.label} className="rounded-xl border border-travel-border bg-travel-background p-4">
          <p className="font-medium text-travel-text">{method.label}</p>
          {method.description && <p className="mt-1 text-sm text-travel-muted">{method.description}</p>}
        </li>
      ))}
    </ul>
  );
}
