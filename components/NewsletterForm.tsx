"use client";

import { useState, type FormEvent } from "react";
import { buttonStyles } from "@/components/ui/buttons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Feedback = { kind: "error" | "info"; message: string } | null;

// Valida el correo en el cliente. Todavía no hay backend: al enviar un correo válido NO se guarda nada
// y el mensaje lo dice con claridad (no se simula una suscripción).
export default function NewsletterForm() {
  const [feedback, setFeedback] = useState<Feedback>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();

    if (!email) {
      setFeedback({ kind: "error", message: "Escribe tu correo electrónico." });
    } else if (!EMAIL_PATTERN.test(email)) {
      setFeedback({
        kind: "error",
        message: "Revisa el formato del correo (por ejemplo, nombre@dominio.com).",
      });
    } else {
      setFeedback({
        kind: "info",
        message:
          "Gracias por tu interés. La suscripción todavía no está habilitada, así que no guardamos tu correo.",
      });
      event.currentTarget.reset();
    }
  }

  const invalid = feedback?.kind === "error";

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-xl">
      <label htmlFor="newsletter-email" className="text-sm font-medium">
        Correo electrónico
      </label>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@dominio.com"
          aria-invalid={invalid}
          aria-describedby="newsletter-feedback"
          className="h-11 w-full rounded-lg border border-travel-muted bg-travel-background px-3 text-base text-travel-text placeholder:text-travel-muted"
        />
        <button type="submit" className={`${buttonStyles.primary} h-11 shrink-0 sm:px-8`}>
          Suscribirme
        </button>
      </div>
      <div id="newsletter-feedback" role="status" aria-live="polite" className="mt-3 min-h-6">
        {feedback && (
          <p
            className={`inline-block rounded-md bg-travel-background px-3 py-2 text-sm ${
              invalid ? "text-travel-danger" : "text-travel-text"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </form>
  );
}
