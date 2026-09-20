"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import SafeImage from "@/components/ui/SafeImage";

type PackageGalleryProps = {
  name: string;
  // La primera es la foto principal; el resto, las secundarias.
  images: string[];
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

// Foto principal + miniaturas. Todo es operable con teclado: las miniaturas son botones (Tab, Enter/Espacio),
// "Ampliar foto" abre un <dialog> modal con flechas ← → para cambiar de foto y Escape para cerrar.
export default function PackageGallery({ name, images }: PackageGalleryProps) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef("");
  const total = images.length;

  const step = (delta: number) => setIndex((current) => (current + delta + total) % total);
  const photoLabel = `${name}, foto ${index + 1} de ${total}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const restoreScroll = () => {
      document.body.style.overflow = previousOverflow.current;
    };
    dialog.addEventListener("close", restoreScroll);
    return () => {
      dialog.removeEventListener("close", restoreScroll);
      if (dialog.open) restoreScroll();
    };
  }, []);

  function openZoom() {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <SafeImage
          src={images[index]}
          alt={photoLabel}
          label={`${name} · foto ${index + 1}`}
          sizes="(min-width: 1024px) 55vw, 100vw"
          eager={index === 0}
        />
        <button
          type="button"
          onClick={openZoom}
          aria-label="Ampliar foto"
          aria-haspopup="dialog"
          className="absolute inset-0 cursor-zoom-in rounded-2xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-black/60 text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            focusable="false"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-4.5-4.5M11 8.5v5M8.5 11h5" />
          </svg>
        </span>
      </div>
      {/* Anuncia el cambio de foto a lectores de pantalla sin mover el foco. */}
      <p className="sr-only" aria-live="polite">
        {photoLabel}
      </p>

      <ul className="mt-3 grid grid-cols-5 gap-2">
        {images.map((src, position) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Ver foto ${position + 1} de ${total}`}
              aria-current={position === index ? "true" : undefined}
              className={`block w-full overflow-hidden rounded-lg ${
                position === index ? "ring-2 ring-travel-primary" : "ring-1 ring-travel-border"
              }`}
            >
              <span className="relative block aspect-[4/3]">
                <SafeImage
                  src={src}
                  alt=""
                  label={`Foto ${position + 1}`}
                  showLabel={false}
                  sizes="(min-width: 1024px) 11vw, 20vw"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`Galería de ${name}`}
        onKeyDown={onDialogKeyDown}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none flex-col bg-black p-0 text-white backdrop:bg-black open:flex"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <p aria-live="polite" className="text-sm font-medium">
            Foto {index + 1} de {total}
          </p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar galería"
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="relative flex-1">
          <SafeImage
            src={images[index]}
            alt={photoLabel}
            label={`${name} · foto ${index + 1}`}
            sizes="100vw"
            fit="contain"
          />
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 focus-visible:outline-white"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 focus-visible:outline-white"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </dialog>
    </div>
  );
}
