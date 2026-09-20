import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { buttonStyles } from "@/components/ui/buttons";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden text-white"
    >
      {/* Imagen decorativa (alt vacío); el degradado oscuro asegura el contraste del texto con cualquier foto. */}
      <SafeImage
        src="/images/travel-hero.jpg"
        alt=""
        label="Mundo Viajero"
        showLabel={false}
        sizes="100vw"
        eager
      />
      <div className="absolute inset-0 bg-gradient-to-r from-travel-primary-dark/90 via-travel-primary-dark/65 to-travel-primary-dark/30" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
        <p className="inline-block rounded-full bg-travel-accent-light px-3 py-1 text-sm font-semibold text-travel-primary-dark">
          Asesoría de viajes a tu medida
        </p>
        <h1
          id="hero-title"
          className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Tu próximo viaje, planeado con buena asesoría
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/90">
          Cuéntanos a dónde quieres ir y armamos una cotización a tu medida:
          destinos, paquetes, experiencias y eventos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quote" className={buttonStyles.primary}>
            Cotizar mi viaje
          </Link>
          <Link href="/destinations" className={buttonStyles.onDark}>
            Explorar destinos
          </Link>
        </div>
      </div>
    </section>
  );
}
