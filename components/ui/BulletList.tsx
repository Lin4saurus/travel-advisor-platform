// Lista de puntos con una marca circular (sin <ul> con viñetas nativas). `marker="check"` para lo confirmado
// (verde), `"dot"` para información general. Compartida entre el detalle de paquete y las páginas de M11
// (`/terms`, `/booking-info`) para no repetir el mismo marcado.
export default function BulletList({ items, marker }: { items: string[]; marker: "check" | "dot" }) {
  return (
    <ul className="space-y-2 text-travel-text">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className={`mt-2 size-2 shrink-0 rounded-full ${marker === "check" ? "bg-travel-success" : "bg-travel-muted"}`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
