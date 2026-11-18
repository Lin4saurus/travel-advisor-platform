import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import BulletList from "@/components/ui/BulletList";
import { buttonStyles } from "@/components/ui/buttons";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sobre nosotros",
  description:
    "Mundo Viajero es una agencia de asesoría y cotización de viajes: te ayudamos a planificar viajes nacionales e internacionales a tu medida.",
  path: "/about",
});

// Sobre nosotros (M13; antes era una página provisional). Describe lo que el sitio hace de verdad: sin años de
// trayectoria, cifras de clientes, premios ni equipo, porque ninguno de esos datos está confirmado. Cuando el
// negocio los defina se pueden agregar aquí.
const steps = [
  {
    title: "Nos cuentas tu idea",
    text: "Desde el formulario de cotización: destino (o si quieres sugerencias), fechas, viajeros, preferencias y presupuesto.",
  },
  {
    title: "Armamos una propuesta",
    text: "Revisamos tu solicitud y buscamos opciones de vuelos, alojamiento, traslados y actividades según lo que pediste.",
  },
  {
    title: "Confirmamos contigo",
    text: "Te contactamos por el medio que elegiste. Precios, fechas y disponibilidad se confirman en ese momento con cada proveedor.",
  },
];

const linkClass = "rounded-sm text-travel-primary underline underline-offset-4 hover:decoration-2";

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Sobre nosotros" }]} />
      </div>

      <PageHeader
        title="Sobre nosotros"
        description="Somos Mundo Viajero: asesoría, cotización y venta de viajes, por Bolivia y por el mundo."
      />

      <Section id="que-hacemos" title="Qué hacemos">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Te ayudamos a planificar tu viaje de principio a fin: elegir el destino, armar el paquete que se ajuste a
            tus fechas y a tu presupuesto, y sumar experiencias, excursiones o eventos.
          </p>
          <BulletList
            marker="check"
            items={[
              "Destinos internacionales: playas, grandes ciudades, parques temáticos y más.",
              "Viajes nacionales por Bolivia: salares, selva, valles y ciudades con historia.",
              "Paquetes armados y viajes a medida.",
              "Experiencias, excursiones y viajes para asistir a eventos.",
            ]}
          />
        </div>
      </Section>

      <Section id="como-trabajamos" title="Cómo trabajamos" tone="surface">
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-travel-border bg-travel-background p-6">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-travel-primary text-sm font-semibold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-travel-primary-dark">{step.title}</h3>
              <p className="mt-2 text-travel-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="transparencia" title="Información clara">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Lo que publicamos es referencial: si un precio, una fecha o la disponibilidad no están confirmados, lo
            decimos («Consultar precio», «Fecha por confirmar») en lugar de mostrar un dato que podría no ser real.
            Los eventos marcados como «Ejemplo ilustrativo» no son eventos confirmados.
          </p>
          <p>
            Las condiciones generales están en{" "}
            <Link href="/terms" className={linkClass}>
              Términos y condiciones
            </Link>{" "}
            y el uso de tus datos, en la{" "}
            <Link href="/privacy" className={linkClass}>
              Política de privacidad
            </Link>
            .
          </p>
        </div>
      </Section>

      <section aria-labelledby="cta-title" className="bg-travel-accent-light">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 id="cta-title" className="text-2xl font-semibold tracking-tight text-travel-primary-dark">
              ¿Planeas un viaje?
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
