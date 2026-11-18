"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/quotes", label: "Cotizaciones" },
  { href: "/admin/catalog/packages", label: "Paquetes" },
  { href: "/admin/catalog/destinations", label: "Destinos" },
  { href: "/admin/catalog/experiences", label: "Experiencias" },
  { href: "/admin/catalog/events", label: "Eventos" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition ${
              active
                ? "bg-travel-primary text-white"
                : "text-travel-text hover:bg-travel-surface"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
