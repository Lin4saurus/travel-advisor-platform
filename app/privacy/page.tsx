import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ContactChannel from "@/components/ContactChannel";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import BulletList from "@/components/ui/BulletList";

const linkClass = "rounded-sm text-travel-primary underline-offset-4 hover:underline";

// Política de privacidad (M11). Describe lo que el sitio realmente hace hoy (verificado en M9/M10): qué datos
// junta el formulario de cotización, dónde quedan y qué no hace todavía (sin cookies de seguimiento, el
// newsletter no guarda nada). Nada de plazos de retención ni promesas que no estén definidas.
export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Política de privacidad" }]} />
      </div>

      <PageHeader
        title="Política de privacidad"
        description="Qué datos personales recopilamos en Mundo Viajero, para qué los usamos y qué derechos tienes."
      />

      <Section id="datos" title="Qué datos recopilamos">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Cuando envías una solicitud en <Link href="/quote" className={linkClass}>Cotizar mi viaje</Link>{" "}
            guardamos los datos que completas en el formulario:
          </p>
          <BulletList
            marker="dot"
            items={[
              "Datos de contacto: nombre, correo electrónico, teléfono y el medio por el que prefieres que te contactemos.",
              "Datos del viaje: destino, fechas (o si son flexibles), cantidad de adultos y niños (con su edad), y el paquete, la experiencia o el evento que hayas elegido, si corresponde.",
              "Preferencias: tipos de viaje, servicios que te interesan (vuelos, traslados, excursiones) y los comentarios que escribas.",
              "Presupuesto: la moneda, el rango y el monto aproximado que indiques (son orientativos, no un compromiso de precio).",
            ]}
          />
          <p>
            El formulario de correo del pie de página («Recibe ideas para tu próximo viaje») todavía no guarda
            nada: valida el formato del correo y lo dice explícitamente antes de enviarlo.
          </p>
        </div>
      </Section>

      <Section id="uso" title="Para qué los usamos" tone="surface">
        <div className="max-w-3xl text-travel-text">
          <p>
            Usamos estos datos para responder a tu solicitud de cotización y contactarte por el medio que
            elegiste. No los usamos para ningún otro fin ni los compartimos con terceros con fines comerciales.
          </p>
        </div>
      </Section>

      <Section id="almacenamiento" title="Dónde se almacenan">
        <div className="max-w-3xl text-travel-text">
          <p>
            Tu solicitud se guarda en Supabase, nuestro proveedor de base de datos. El sitio no guarda tus datos en
            el navegador (ni en cookies ni en el almacenamiento local): si recargas o cierras la página antes de
            enviar el formulario, lo que hayas escrito se pierde.
          </p>
        </div>
      </Section>

      <Section id="cookies" title="Cookies y seguimiento" tone="surface">
        <div className="max-w-3xl text-travel-text">
          <p>
            Este sitio no usa cookies de seguimiento ni herramientas de analítica o publicidad.
          </p>
        </div>
      </Section>

      <Section id="derechos" title="Tus derechos">
        <div className="max-w-3xl space-y-4 text-travel-text">
          <p>
            Puedes pedirnos acceder, corregir o eliminar los datos de una solicitud que hayas enviado. Escríbenos a{" "}
            <ContactChannel purpose="reservations" /> indicando tu número de referencia (si lo tienes) o los datos
            de contacto con los que enviaste la solicitud.
          </p>
        </div>
      </Section>

      <Section id="cambios" title="Cambios a esta política" tone="surface">
        <div className="max-w-3xl text-travel-text">
          <p>
            Podemos actualizar esta política a medida que el sitio incorpore nuevas funciones (por ejemplo, cuentas
            de usuario o un panel de administración). Los cambios se publican en esta misma página.
          </p>
        </div>
      </Section>
    </main>
  );
}
