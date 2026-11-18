import Link from "next/link";
import Logo from "@/components/Logo";
import { footerNav, siteConfig, type NavLink } from "@/config/site";

const linkClass =
  "rounded-sm text-travel-text underline-offset-4 hover:text-travel-primary hover:underline";

function LinkList({ links }: { links: NavLink[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={linkClass}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  const { contact, social } = siteConfig;

  const contactItems: { label: string; value: string; href?: string }[] = [];
  if (contact.email) {
    contactItems.push({
      label: "Correo",
      value: contact.email,
      href: `mailto:${contact.email}`,
    });
  }
  if (contact.phone) {
    contactItems.push({
      label: "Teléfono",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, "")}`,
    });
  }
  if (contact.address) {
    contactItems.push({ label: "Dirección", value: contact.address });
  }
  if (contact.hours) {
    contactItems.push({ label: "Horario", value: contact.hours });
  }

  const headingClass =
    "text-sm font-semibold uppercase tracking-wide text-travel-primary-dark";

  return (
    <footer className="border-t border-travel-border bg-travel-sand">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-travel-muted">
            {siteConfig.tagline}
          </p>
          {social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {social.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {link.label}
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className={headingClass}>Explorar</h2>
          <LinkList links={footerNav.explore} />
        </div>

        <div>
          <h2 className={headingClass}>Ayuda</h2>
          <LinkList links={footerNav.help} />
        </div>

        <div>
          <h2 className={headingClass}>Contacto</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {contactItems.map((item) => (
              <li key={item.label}>
                <span className="text-travel-muted">{item.label}: </span>
                {item.href ? (
                  <a href={item.href} className={linkClass}>
                    {item.value}
                  </a>
                ) : (
                  <span className="text-travel-text">{item.value}</span>
                )}
              </li>
            ))}
            <li>
              <Link href="/contact" className={linkClass}>
                Escríbenos desde el formulario de contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-travel-border bg-travel-background">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-travel-muted sm:px-6">
          Precios, fechas y disponibilidad son referenciales y se confirman en tu cotización; las imágenes son
          ilustrativas. Los cambios y las cancelaciones pueden generar penalidades según cada proveedor. Ver{" "}
          {/* Subrayado siempre: dentro de un párrafo, el color solo no basta para distinguir el enlace (WCAG 1.4.1). */}
          <Link href="/terms" className={`${linkClass} underline`}>
            términos y condiciones
          </Link>
          .
        </p>
      </div>

      <div className="border-t border-travel-border">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-sm text-travel-muted sm:px-6">
          © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
