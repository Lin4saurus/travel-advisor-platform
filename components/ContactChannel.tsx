import Link from "next/link";
import { siteConfig } from "@/config/site";

// Canal de contacto configurable (M11): si hay un correo definido en config/site.ts, un enlace mailto; si no,
// remite al formulario de /contact. `purpose="reservations"` prioriza `contact.reservationsEmail` y cae de
// vuelta a `contact.email` si ese no está definido.
export default function ContactChannel({ purpose = "general" }: { purpose?: "reservations" | "general" }) {
  const email =
    purpose === "reservations"
      ? (siteConfig.contact.reservationsEmail ?? siteConfig.contact.email)
      : siteConfig.contact.email;

  if (email) {
    return (
      <a
        href={`mailto:${email}`}
        className="rounded-sm text-travel-primary underline-offset-4 hover:underline"
      >
        {email}
      </a>
    );
  }

  return (
    <Link href="/contact" className="rounded-sm text-travel-primary underline-offset-4 hover:underline">
      Escríbenos desde el formulario de contacto
    </Link>
  );
}
