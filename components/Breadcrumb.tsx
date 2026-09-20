import Link from "next/link";

type Crumb = { label: string; href?: string };

// Migas de pan: el último elemento (sin `href`) es la página actual.
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Migas de pan">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-travel-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="rounded-sm underline-offset-4 hover:text-travel-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-travel-text">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
