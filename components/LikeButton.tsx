"use client";

import { useState, useTransition } from "react";
import { setLikeAction } from "@/app/like-actions";
import type { LikeKind, LikeState } from "@/lib/likes";

// Botón "Me gusta" con contador partido (estilos `.like-button*` en app/globals.css), adaptado del ejemplo de UI
// "split counter like button" que pasó el usuario. Cambios respecto del ejemplo, por accesibilidad: es un
// `<button aria-pressed>` real (el ejemplo usaba un `<input hidden>` + `<label>`, que no se alcanza con el
// teclado) y usa los colores de la marca (blanco sobre el cian del ejemplo no llega a 3:1).
//
// El número es el conteo real de `catalog_likes`: la página solo pinta el botón si pudo leerlo (lib/likes.ts).
const formatCount = (n: number) => new Intl.NumberFormat("es", { notation: "compact" }).format(n);

export default function LikeButton({
  kind,
  slug,
  itemName,
  initial,
}: {
  kind: LikeKind;
  slug: string;
  itemName: string;
  initial: LikeState;
}) {
  const [state, setState] = useState(initial);
  // Número que sale (se anima hacia abajo) cuando cambia el conteo.
  const [previous, setPrevious] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (pending) return;
    const before = state;
    const want = !before.liked;
    // Respuesta inmediata (optimista); el servidor confirma el número real.
    setPrevious(before.count);
    setState({ liked: want, count: Math.max(0, before.count + (want ? 1 : -1)) });
    setError(null);
    startTransition(async () => {
      const result = await setLikeAction(kind, slug, want);
      if (result) {
        setState(result);
      } else {
        setPrevious(null);
        setState(before);
        setError("No pudimos guardar tu «Me gusta». Inténtalo de nuevo.");
      }
    });
  }

  return (
    <div className="like-button-wrap">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={state.liked}
        aria-label={`Me gusta: ${itemName} (${state.count} ${state.count === 1 ? "persona" : "personas"})`}
        className="like-button"
        data-liked={state.liked ? "" : undefined}
      >
        <span className="like-button__count" aria-hidden="true">
          {previous !== null && previous !== state.count && (
            <span key={`out-${previous}-${state.count}`} className="like-button__num like-button__num--out">
              {formatCount(previous)}
            </span>
          )}
          <span key={`in-${state.count}`} className={`like-button__num ${previous !== null ? "like-button__num--in" : ""}`}>
            {formatCount(state.count)}
          </span>
        </span>
        <span className="like-button__label" aria-hidden="true">
          <svg
            className="like-button__icon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill={state.liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <span className="like-button__text">{state.liked ? "Te gusta" : "Me gusta"}</span>
        </span>
      </button>
      <p role="status" aria-live="polite" className="like-button__status">
        {error ?? ""}
      </p>
    </div>
  );
}
