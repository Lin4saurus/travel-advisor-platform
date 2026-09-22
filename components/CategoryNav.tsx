import Link from "next/link";

export type CategoryNavItem = { slug: string; name: string; count: number };

type CategoryNavProps = {
  // Nombre accesible de la navegación (p. ej. "Categorías de experiencias").
  label: string;
  total: number;
  items: CategoryNavItem[];
  // Slug de la categoría activa (undefined = "Todas").
  active?: string;
  hrefFor: (slug?: string) => string;
  emptyHint: string;
};

const chipBase = "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium";
const chipOn = "border-travel-primary bg-travel-primary text-white";
const chipOff = "border-travel-primary text-travel-primary hover:bg-travel-surface";

// Filtros por categoría como enlaces (el estado vive en la URL). Una categoría sin elementos se muestra
// deshabilitada —no es enlace ni recibe foco—, salvo que ya sea la activa (se llegó a ella por URL).
export default function CategoryNav({ label, total, items, active, hrefFor, emptyHint }: CategoryNavProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href={hrefFor()}
            aria-current={active ? undefined : "page"}
            className={`${chipBase} ${active ? chipOff : chipOn}`}
          >
            Todas ({total})
          </Link>
        </li>
        {items.map((item) => {
          const isActive = item.slug === active;
          if (item.count === 0 && !isActive) {
            return (
              <li key={item.slug}>
                <span
                  aria-disabled="true"
                  title={emptyHint}
                  className={`${chipBase} cursor-not-allowed border-dashed border-travel-border text-travel-muted`}
                >
                  {item.name} (0)
                </span>
              </li>
            );
          }
          return (
            <li key={item.slug}>
              <Link
                href={hrefFor(item.slug)}
                aria-current={isActive ? "page" : undefined}
                className={`${chipBase} ${isActive ? chipOn : chipOff}`}
              >
                {item.name} ({item.count})
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
