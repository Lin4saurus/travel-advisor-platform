import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { buttonStyles } from "@/components/ui/buttons";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contacto y oficinas",
  description:
    "Teléfonos, WhatsApp, correo y oficinas de Universal Tours en Santa Cruz de la Sierra, con sus horarios de atención.",
  path: "/contact",
});

const linkClass = "rounded-sm text-travel-primary underline underline-offset-4 hover:decoration-2";

type Channel = { label: string; value: string; href: string | null; external?: boolean };

// Contacto: canales y oficinas de `config/site.ts` (datos reales de Universal Tours). Si un dato se borra de la
// configuración, simplemente deja de mostrarse. No hay formulario de contacto propio: para una propuesta de
// viaje está el formulario de cotización, que guarda la solicitud y pide los datos para responder.
export default function ContactPage() {
  const { email, reservationsEmail, phone, phoneHref, whatsapp, whatsappLabel } = siteConfig.contact;
  const channels: Channel[] = [];
  if (whatsapp) {
    channels.push({ label: "WhatsApp", value: whatsappLabel ?? `+${whatsapp}`, href: `https://wa.me/${whatsapp}`, external: true });
  }
  if (phone) channels.push({ label: "Teléfono", value: phone, href: phoneHref ? `tel:${phoneHref}` : null });
  if (email) channels.push({ label: "Correo", value: email, href: `mailto:${email}` });
  if (reservationsEmail && reservationsEmail !== email) {
    channels.push({ label: "Reservas y cambios", value: reservationsEmail, href: `mailto:${reservationsEmail}` });
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Contacto" }]} />
      </div>

      <PageHeader
        title="Contacto y oficinas"
        description="Escríbenos, llámanos o visítanos: nuestros asesores te ayudan a planificar tu viaje."
      />

      {channels.length > 0 && (
        <Section id="canales" title="Escríbenos o llámanos">
          <dl className="grid gap-4 sm:grid-cols-3">
            {channels.map((channel) => (
              // `min-w-0` + `overflow-wrap:anywhere`: el correo es una sola "palabra" larga; sin esto la tarjeta se
              // ensanchaba para no cortarlo y la página desbordaba 24 px a 320 px.
              <div key={channel.label} className="min-w-0 rounded-xl border border-travel-border bg-travel-background p-5">
                <dt className="text-sm font-medium text-travel-muted">{channel.label}</dt>
                <dd className="mt-1 text-lg font-semibold text-travel-text [overflow-wrap:anywhere]">
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className={linkClass}
                      {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {channel.value}
                      {channel.external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
                    </a>
                  ) : (
                    channel.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {siteConfig.branches.length > 0 && (
        <Section id="oficinas" title="Nuestras oficinas" tone="surface">
          <ul className="grid gap-6 md:grid-cols-2">
            {siteConfig.branches.map((branch) => (
              <li key={branch.name} className="rounded-2xl border border-travel-border bg-travel-background p-6">
                <h3 className="text-xl font-semibold text-travel-primary-dark">{branch.name}</h3>
                <p className="mt-2 text-travel-text">{branch.address}</p>
                <ul className="mt-4 space-y-1">
                  {branch.phones.map((entry) => (
                    <li key={entry.href}>
                      <a
                        href={entry.href.startsWith("http") ? entry.href : `tel:${entry.href}`}
                        className={linkClass}
                        {...(entry.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {entry.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <p className="text-sm font-medium text-travel-muted">Horario de atención</p>
                  <ul className="mt-1 text-travel-text">
                    {branch.hours.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="cotizar" title="¿Quieres una propuesta de viaje?">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Completa el formulario de cotización con tu destino, fechas, viajeros y presupuesto. Tiene un espacio de
            comentarios para cualquier duda y te respondemos por el medio que prefieras.
          </p>
          <p>
            Si ya enviaste una solicitud y quieres cambiar algo, escríbenos indicando tu número de referencia
            (TV-2026-####). Más detalles en{" "}
            <Link href="/booking-info#cambios" className={linkClass}>
              Información de reservas
            </Link>
            .
          </p>
          <div className="pt-2">
            <Link href="/quote" className={buttonStyles.secondary}>
              Cotizar mi viaje
            </Link>
          </div>
        </div>
      </Section>

      {siteConfig.social.length > 0 && (
        <Section id="redes" title="Síguenos" tone="surface">
          <ul className="flex flex-wrap gap-3">
            {siteConfig.social.map((network) => (
              <li key={network.href}>
                <a
                  href={network.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full border border-travel-primary bg-travel-background px-5 font-medium text-travel-primary hover:bg-travel-surface"
                >
                  {network.label}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </main>
  );
}
