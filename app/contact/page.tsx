import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { buttonStyles } from "@/components/ui/buttons";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contacto",
  description: "Cómo comunicarte con Mundo Viajero para cotizar un viaje o consultar por una solicitud que ya enviaste.",
  path: "/contact",
});

const linkClass = "rounded-sm text-travel-primary underline underline-offset-4 hover:decoration-2";

type Channel = { label: string; value: string; href: string | null };

// Contacto (M13; antes era una página provisional). Muestra solo los canales configurados en `config/site.ts`
// (hoy ninguno: correo, teléfono, dirección y redes están en `null`/vacío porque no hay datos confirmados). No hay
// un formulario de contacto propio: el canal que sí funciona y guarda de verdad es el de cotización, que tiene un
// campo de comentarios libre y pide los datos para responder.
export default function ContactPage() {
  const { email, reservationsEmail, phone, address, hours } = siteConfig.contact;
  const channels: Channel[] = [];
  if (email) channels.push({ label: "Correo", value: email, href: `mailto:${email}` });
  if (reservationsEmail && reservationsEmail !== email) {
    channels.push({ label: "Reservas y cambios", value: reservationsEmail, href: `mailto:${reservationsEmail}` });
  }
  if (phone) channels.push({ label: "Teléfono", value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` });
  if (address) channels.push({ label: "Dirección", value: address, href: null });
  if (hours) channels.push({ label: "Horario de atención", value: hours, href: null });

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Contacto" }]} />
      </div>

      <PageHeader
        title="Contacto"
        description="Escríbenos para cotizar un viaje o consultar por una solicitud que ya enviaste."
      />

      <Section id="cotizar" title="Para cotizar un viaje o hacer una consulta">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            La forma más directa de escribirnos es el formulario de cotización. Además de tu destino, fechas y
            viajeros, tiene un espacio de comentarios donde puedes contarnos cualquier duda; con los datos de contacto
            que dejes, te respondemos por el medio que prefieras.
          </p>
          <p>
            Si ya enviaste una solicitud y quieres cambiar algo, envía una nueva e indica en los comentarios tu número
            de referencia (TV-2026-####). Más detalles en{" "}
            <Link href="/booking-info#cambios" className={linkClass}>
              Información de reservas
            </Link>
            .
          </p>
          <div className="pt-2">
            <Link href="/quote" className={buttonStyles.secondary}>
              Ir al formulario de cotización
            </Link>
          </div>
        </div>
      </Section>

      <Section id="canales" title="Otros canales" tone="surface">
        {channels.length > 0 || siteConfig.social.length > 0 ? (
          <dl className="grid max-w-3xl gap-4 sm:grid-cols-2">
            {channels.map((channel) => (
              <div key={channel.label} className="rounded-xl border border-travel-border bg-travel-background p-4">
                <dt className="text-sm font-medium text-travel-muted">{channel.label}</dt>
                <dd className="mt-1 break-words text-travel-text">
                  {channel.href ? (
                    <a href={channel.href} className={linkClass}>
                      {channel.value}
                    </a>
                  ) : (
                    channel.value
                  )}
                </dd>
              </div>
            ))}
            {siteConfig.social.length > 0 && (
              <div className="rounded-xl border border-travel-border bg-travel-background p-4">
                <dt className="text-sm font-medium text-travel-muted">Redes sociales</dt>
                <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {siteConfig.social.map((network) => (
                    <a key={network.href} href={network.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {network.label}
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="max-w-3xl text-travel-text">
            Todavía no publicamos un correo, un teléfono ni redes sociales en el sitio. Mientras tanto, el formulario
            de cotización es el canal para escribirnos.
          </p>
        )}
      </Section>
    </main>
  );
}
