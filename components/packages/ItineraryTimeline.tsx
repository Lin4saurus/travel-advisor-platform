"use client";

import { useEffect, useRef } from "react";
import type { ItineraryDay } from "@/data/packages";

// Itinerario como línea de tiempo animada (estilos `.timeline*` en app/globals.css). Cada día aparece al entrar
// en la vista (IntersectionObserver), como en el ejemplo de UI que pasó el usuario. Sin JavaScript, o con la
// preferencia "reducir movimiento", no se marca `data-animate` y la lista se ve completa desde el principio.
export default function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    list.dataset.animate = "";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("timeline__item--in", entry.isIntersecting);
        }
      },
      // Umbral bajo (el ejemplo usaba 1): un día con una descripción más alta que la pantalla nunca llegaría a
      // estar visible al 100 % y se quedaría oculto.
      { threshold: 0.15 },
    );
    for (const item of list.querySelectorAll(".timeline__item")) observer.observe(item);

    return () => {
      observer.disconnect();
      delete list.dataset.animate;
    };
  }, [days]);

  return (
    <ol ref={listRef} className="timeline">
      {days.map((day, position) => (
        <li key={`${position}-${day.title}`} className="timeline__item">
          <span className="timeline__day">Día {position + 1}</span>
          <h3 className="timeline__title font-semibold text-travel-text">{day.title}</h3>
          {day.description && (
            <p className="timeline__text mt-1 whitespace-pre-line text-travel-muted">{day.description}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
