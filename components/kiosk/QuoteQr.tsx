import { headers } from "next/headers";
import QRCode from "qrcode";

// QR para seguir la cotización en el celular (el kiosco no pide datos personales en la pantalla compartida).
// La URL se arma con el host de la propia petición: funciona igual en localhost, en la URL de Vercel o en un
// dominio propio, sin depender de NEXT_PUBLIC_SITE_URL.
export default async function QuoteQr({ path, title }: { path: string; title: string }) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const url = `${proto}://${host}${path}`;
  // SVG generado por la librería a partir de nuestra propia URL (no hay contenido de terceros).
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#07345a", light: "#ffffff" } });

  return (
    <section
      aria-labelledby="kiosk-qr-title"
      className="flex flex-col items-center gap-5 rounded-3xl bg-travel-background p-8 text-center shadow-sm sm:flex-row sm:text-left"
    >
      <div
        role="img"
        aria-label={`Código QR para ${title}`}
        className="size-48 shrink-0 rounded-2xl border border-travel-border p-2 [&_svg]:size-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div>
        <h2 id="kiosk-qr-title" className="text-2xl font-semibold text-travel-primary-dark">
          {title}
        </h2>
        <p className="mt-2 text-travel-text">
          Escanea el código con la cámara de tu celular y completa la cotización ahí, con tus datos y con calma.
        </p>
        <p className="mt-2 text-base text-travel-muted">
          O pídela en el mostrador: te ayudamos con gusto.
        </p>
      </div>
    </section>
  );
}
