import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ContactChannel from "@/components/ContactChannel";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import BulletList from "@/components/ui/BulletList";
import { conditions, importantInfo } from "@/config/packages";

const linkClass = "rounded-sm text-travel-primary underline-offset-4 hover:underline";

// Términos y condiciones (M11). Contenido general y editable: nada de cifras ni penalidades inventadas.
// Reutiliza `importantInfo`/`conditions` de config/packages.ts (los mismos textos que ya se ven en el detalle de
// cada paquete) para no mantener dos redacciones distintas de lo mismo.
export default function TermsPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Términos y condiciones" }]} />
      </div>

      <PageHeader
        title="Términos y condiciones"
        description="Condiciones generales de uso del sitio y de las solicitudes de cotización de Mundo Viajero."
      />

      <Section id="alcance" title="Sobre estas condiciones">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Mundo Viajero es una plataforma de asesoría, cotización y venta de viajes. El contenido del sitio
            (destinos, paquetes, experiencias y eventos) es informativo: completar el formulario de{" "}
            <Link href="/quote" className={linkClass}>Cotizar mi viaje</Link> envía una{" "}
            <strong>solicitud de cotización</strong>, no una reserva confirmada. Más detalle del proceso en{" "}
            <Link href="/booking-info" className={linkClass}>Información de reservas</Link>.
          </p>
        </div>
      </Section>

      <Section id="precios" title="Precios, fechas y disponibilidad" tone="surface">
        <div className="max-w-3xl">
          <BulletList items={importantInfo} marker="dot" />
        </div>
      </Section>

      <Section id="cambios" title="Cambios, cancelaciones y penalidades">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <BulletList items={conditions} marker="dot" />
          <p>
            Los cambios o cancelaciones pueden generar penalidades: dependen de las condiciones de cada aerolínea,
            hotel u operador, y se detallan en tu cotización antes de confirmar.
          </p>
        </div>
      </Section>

      <Section id="eventos" title="Eventos" tone="surface">
        <div className="max-w-3xl text-travel-text">
          <p>
            Los eventos que se muestran como ejemplo son ilustrativos: no representan artistas, fechas ni entradas
            confirmadas. El estado real de cada evento (fechas por confirmar, disponibilidad, confirmado o agotado)
            se indica en su propia página.
          </p>
        </div>
      </Section>

      <Section id="privacidad" title="Datos personales">
        <div className="max-w-3xl text-travel-text">
          <p>
            El tratamiento de los datos que nos compartes (por ejemplo, al enviar una cotización) se describe en
            nuestra <Link href="/privacy" className={linkClass}>Política de privacidad</Link>.
          </p>
        </div>
      </Section>

      <Section id="contacto" title="Contacto" tone="surface">
        <div className="max-w-3xl text-travel-text">
          <p>
            ¿Tienes dudas sobre estas condiciones? Escríbenos a <ContactChannel />.
          </p>
        </div>
      </Section>
    </main>
  );
}
