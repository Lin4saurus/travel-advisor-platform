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
    "Universal Tours: agencia de viajes boliviana fundada en 1975 en Santa Cruz de la Sierra, con certificación IATA. Vuelos, hoteles, paquetes y viajes corporativos.",
  path: "/about",
});

// Sobre nosotros. Datos de la empresa tomados de universaltours.com.bo ("¿Quiénes somos?", portada y "Servicios",
// revisados el 2026-11-20): fecha de fundación, certificación IATA, red LTN, representación de Hertz y Dollar,
// oficinas y servicios. Los textos están redactados aquí (no copiados de ese sitio).
const FOUNDED = new Date("1975-08-28T00:00:00-04:00");

function yearsSinceFounding(now = new Date()) {
  const years = now.getFullYear() - FOUNDED.getFullYear();
  const beforeAnniversary =
    now.getMonth() < FOUNDED.getMonth() || (now.getMonth() === FOUNDED.getMonth() && now.getDate() < FOUNDED.getDate());
  return beforeAnniversary ? years - 1 : years;
}

const steps = [
  {
    title: "Nos cuentas tu idea",
    text: "En una de nuestras oficinas, por WhatsApp o desde el formulario de cotización: destino, fechas, viajeros y presupuesto.",
  },
  {
    title: "Armamos una propuesta",
    text: "Un asesor busca opciones de vuelos, alojamiento, traslados y actividades según lo que pediste.",
  },
  {
    title: "Confirmamos contigo",
    text: "Precios, fechas y disponibilidad se confirman con cada proveedor antes de reservar.",
  },
];

const linkClass = "rounded-sm text-travel-primary underline underline-offset-4 hover:decoration-2";

export default function AboutPage() {
  const years = yearsSinceFounding();
  const facts = [
    { value: "1975", label: "Fundada el 28 de agosto en Santa Cruz de la Sierra" },
    { value: `${years} años`, label: "Organizando viajes de familias y empresas bolivianas" },
    { value: "IATA", label: "Agencia con certificación internacional IATA" },
    { value: "2 oficinas", label: "Equipetrol y Ventura Mall, en Santa Cruz" },
  ];

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Sobre nosotros" }]} />
      </div>

      <PageHeader
        title="Sobre nosotros"
        description={`Universal Tours es una agencia de viajes boliviana con ${years} años de trayectoria, desde Santa Cruz de la Sierra hacia Bolivia y el mundo.`}
      />

      <Section id="historia" title="Nuestra historia">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="max-w-3xl space-y-4 text-travel-text">
            <p>
              Universal Tours Ltda. nació el 28 de agosto de 1975 en Santa Cruz de la Sierra. Desde entonces, varias
              generaciones de viajeros bolivianos han organizado con nosotros sus vacaciones, viajes de estudio, lunas
              de miel y viajes de trabajo.
            </p>
            <p>
              Hoy trabajamos con un equipo de asesores que atiende en persona y con herramientas de reserva de
              alcance mundial. Somos parte de <strong>L&apos;Alianxa Travel Network (LTN)</strong>, una red
              latinoamericana de agencias de viajes, y somos <strong>representantes exclusivos de Hertz y Dollar</strong>{" "}
              (alquiler de autos) en Bolivia.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.value} className="rounded-2xl border border-travel-border bg-travel-surface p-5">
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="block text-3xl font-semibold text-travel-primary-dark">{fact.value}</span>
                  <span className="mt-1 block text-sm text-travel-muted">{fact.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section id="mision" title="Misión y visión" tone="surface">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-travel-border bg-travel-background p-6">
            <h3 className="text-lg font-semibold text-travel-primary-dark">Misión</h3>
            <p className="mt-2 text-travel-text">
              Que cada viaje sume a la vida de quien lo hace: ayudar a descubrir lugares y culturas nuevas, dentro y
              fuera de Bolivia.
            </p>
          </div>
          <div className="rounded-2xl border border-travel-border bg-travel-background p-6">
            <h3 className="text-lg font-semibold text-travel-primary-dark">Visión</h3>
            <p className="mt-2 text-travel-text">
              Ser la agencia de viajes de referencia en la región por la calidad de la atención, la innovación en lo
              que ofrecemos y un turismo más sostenible.
            </p>
          </div>
        </div>
      </Section>

      <Section id="servicios" title="Qué hacemos">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-travel-primary-dark">Para tus viajes</h3>
            <div className="mt-3">
              <BulletList
                marker="check"
                items={[
                  "Pasajes aéreos nacionales e internacionales.",
                  "Hoteles en todo el mundo y paquetes de vuelo + hotel.",
                  "Viajes por Bolivia: salares, selva, valles y ciudades con historia.",
                  "Alquiler de autos (Hertz y Dollar en Bolivia).",
                  "Seguros de asistencia al viajero.",
                  "Viajes en grupo, bodas y lunas de miel.",
                ]}
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-travel-primary-dark">Para empresas</h3>
            <div className="mt-3">
              <BulletList
                marker="check"
                items={[
                  "Gestión de viajes corporativos y de cuentas.",
                  "Reservas de transporte terrestre y marítimo.",
                  "Trámites de documentación y visas.",
                  "Asistencia en aeropuertos (recepción y acompañamiento).",
                  "Servicios de seguridad para viajeros.",
                  "Reportes de gestión de viajes.",
                ]}
              />
            </div>
          </div>
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
            Lo que publicamos en este sitio es referencial: si un precio, una fecha o la disponibilidad no están
            confirmados, lo decimos («Consultar precio», «Fecha por confirmar»). Todo se confirma en tu cotización.
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
            . ¿Quieres visitarnos? Mira nuestras{" "}
            <Link href="/contact#oficinas" className={linkClass}>
              oficinas y horarios
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
