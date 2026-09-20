"use client";

import Image from "next/image";
import { useState } from "react";

type SafeImageProps = {
  src: string;
  alt: string;
  // Texto del fallback (normalmente el nombre del destino/paquete).
  label: string;
  sizes: string;
  // Para imágenes sobre el pliegue (hero): carga inmediata y prioritaria.
  eager?: boolean;
  showLabel?: boolean;
  // "contain" muestra la foto completa (p. ej. en el zoom de la galería); por defecto recorta para llenar.
  fit?: "cover" | "contain";
  className?: string;
};

// Rellena a su contenedor (que debe ser `relative` y tener tamaño). Debajo de la foto siempre hay un
// fondo degradado + ícono + nombre: si el archivo falta o falla, se ve eso y nunca una imagen rota.
export default function SafeImage({
  src,
  alt,
  label,
  sizes,
  eager = false,
  showLabel = true,
  fit = "cover",
  className = "",
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-travel-primary-dark to-travel-primary">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-white/90"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M21 16l-5-5-8 8" />
        </svg>
        {showLabel && <span className="text-sm font-medium">{label}</span>}
      </div>
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onError={() => setFailedSrc(src)}
          className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
        />
      )}
    </div>
  );
}
