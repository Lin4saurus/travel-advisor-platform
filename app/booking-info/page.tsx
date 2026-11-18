import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ContactChannel from "@/components/ContactChannel";
import PageHeader from "@/components/PageHeader";
import PaymentMethods from "@/components/PaymentMethods";
import Section from "@/components/Section";
import BulletList from "@/components/ui/BulletList";
import { buttonStyles } from "@/components/ui/buttons";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Información de reservas",
  description: "Cómo funciona una solicitud de cotización, cómo pedir cambios y qué formas de pago manejamos.",
  path: "/booking-info",
});

const linkClass = "rounded-sm text-travel-primary underline underline-offset-4 hover:decoration-2";

// Información de reservas (M11): qué es una solicitud de cotización, cómo pedir cambios, formas de pago y qué
// datos conviene tener a mano. Contenido general y editable; nada de plazos ni penalidades inventadas.
export default function BookingInfoPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Información de reservas" }]} />
      </div>

      <PageHeader
        title="Información de reservas"
        description="Cómo funciona una solicitud de cotización, cómo pedir cambios y qué formas de pago manejamos."
      />

      <Section id="proceso" title="De la solicitud a la reserva">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Cuando completas el formulario de <Link href="/quote" className={linkClass}>Cotizar mi viaje</Link>,
            envías una <strong>solicitud de cotización</strong>, no una reserva confirmada. Guardamos tu solicitud y
            te damos un número de referencia (con el formato <code className="rounded bg-travel-surface px-1.5 py-0.5 text-sm">TV-2026-####</code>);
            nuestro equipo la revisa y te contacta por el medio que elegiste para avanzar con los siguientes pasos.
          </p>
          <p>
            Los precios, las fechas y la disponibilidad que ves en el sitio son referenciales: se confirman recién
            en tu cotización.
          </p>
        </div>
      </Section>

      <Section id="cambios" title="Cambios y modificaciones" tone="surface">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Si ya enviaste una solicitud y necesitas cambiar algo (fechas, cantidad de viajeros, destino u otro
            dato), escríbenos a <ContactChannel purpose="reservations" />.
          </p>
          <div>
            <p className="font-medium">Datos que conviene tener a mano:</p>
            <div className="mt-3">
              <BulletList
                marker="dot"
                items={[
                  "Tu número de referencia (TV-2026-####), si ya lo tienes.",
                  "El nombre con el que enviaste la solicitud.",
                  "Qué quieres cambiar y las nuevas fechas o datos.",
                  "Un medio de contacto donde podamos responderte.",
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section id="formas-de-pago" title="Formas de pago">
        <div className="max-w-3xl">
          <PaymentMethods />
        </div>
      </Section>

      <Section id="condiciones" title="Antes de confirmar" tone="surface">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Los cambios y las cancelaciones pueden generar penalidades según las condiciones de cada proveedor
            (aerolínea, hotel, operador). Revisa el detalle en{" "}
            <Link href="/terms#cambios" className={linkClass}>
              Términos y condiciones
            </Link>{" "}
            antes de confirmar tu reserva.
          </p>
        </div>
      </Section>

      <section aria-labelledby="cta-title" className="bg-travel-accent-light">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 id="cta-title" className="text-2xl font-semibold tracking-tight text-travel-primary-dark">
              ¿Todavía no enviaste tu solicitud?
            </h2>
            <p className="mt-1 text-travel-text">Cuéntanos qué tienes en mente y armamos una cotización a tu medida.</p>
          </div>
          <Link href="/quote" className={`${buttonStyles.secondary} shrink-0`}>
            Cotizar mi viaje
          </Link>
        </div>
      </section>
    </main>
  );
}
