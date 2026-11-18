"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { KIOSK_BASE, KIOSK_IDLE_SECONDS, KIOSK_WARNING_SECONDS } from "@/lib/kiosk";

// Reinicio por inactividad del kiosco: tras KIOSK_IDLE_SECONDS sin tocar la pantalla avisa ("¿Sigues ahí?") y,
// si nadie responde en KIOSK_WARNING_SECONDS, vuelve al inicio arriba de todo. Así la próxima persona no
// encuentra la pantalla en la ficha que miraba la anterior.
export default function KioskIdle() {
  const router = useRouter();
  const pathname = usePathname();
  const [warning, setWarning] = useState<number | null>(null);
  const idleTimer = useRef<number | undefined>(undefined);
  const tick = useRef<number | undefined>(undefined);
  const continueRef = useRef<HTMLButtonElement>(null);
  const atHome = pathname === KIOSK_BASE;

  const stopWarning = useCallback(() => {
    window.clearInterval(tick.current);
    setWarning(null);
  }, []);

  const resetToHome = useCallback(() => {
    stopWarning();
    window.scrollTo({ top: 0 });
    if (!atHome) router.replace(KIOSK_BASE);
  }, [atHome, router, stopWarning]);

  const arm = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      // En el inicio, arriba de todo, no hay nada que reiniciar.
      if (atHome && window.scrollY === 0) return;
      let left = KIOSK_WARNING_SECONDS;
      setWarning(left);
      window.clearInterval(tick.current);
      tick.current = window.setInterval(() => {
        left -= 1;
        // El reinicio sale del propio temporizador (no de un efecto que observe la cuenta).
        if (left <= 0) resetToHome();
        else setWarning(left);
      }, 1000);
    }, KIOSK_IDLE_SECONDS * 1000);
  }, [atHome, resetToHome]);

  // Cualquier toque, tecla o desplazamiento cuenta como actividad (y cancela el aviso).
  useEffect(() => {
    const onActivity = () => {
      if (tick.current !== undefined) stopWarning();
      arm();
    };
    const events = ["pointerdown", "keydown", "wheel", "touchmove", "scroll"] as const;
    for (const name of events) window.addEventListener(name, onActivity, { passive: true });
    arm();
    return () => {
      for (const name of events) window.removeEventListener(name, onActivity);
      window.clearTimeout(idleTimer.current);
      window.clearInterval(tick.current);
    };
  }, [arm, stopWarning]);

  useEffect(() => {
    if (warning === KIOSK_WARNING_SECONDS) continueRef.current?.focus();
  }, [warning]);

  if (warning === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-travel-primary-dark/70 p-6">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="kiosk-idle-title"
        aria-describedby="kiosk-idle-text"
        className="w-full max-w-lg rounded-3xl bg-travel-background p-10 text-center shadow-2xl"
      >
        <h2 id="kiosk-idle-title" className="text-3xl font-semibold text-travel-primary-dark">
          ¿Sigues ahí?
        </h2>
        <p id="kiosk-idle-text" className="mt-3 text-xl text-travel-text" aria-live="polite">
          Volvemos al inicio en <strong>{warning}</strong> {warning === 1 ? "segundo" : "segundos"}.
        </p>
        <button
          ref={continueRef}
          type="button"
          onClick={() => {
            stopWarning();
            arm();
          }}
          className="mt-8 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-travel-primary px-6 text-2xl font-semibold text-white"
        >
          Seguir aquí
        </button>
      </div>
    </div>
  );
}
