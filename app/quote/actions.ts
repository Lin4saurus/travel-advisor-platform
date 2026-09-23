"use server";

// Server Action delgada: se limita a reenviar a la capa de datos (`lib/quote-submit.ts`, `server-only`), que es
// donde vive el saneado, la revalidación y el guardado en Supabase. Ver la guía de seguridad de datos de Next
// ("Using a Data Access Layer for mutations") en
// node_modules/next/dist/docs/01-app/02-guides/data-security.md.
//
// Es una Server Action: además de invocarse desde `QuoteStepper`, queda expuesta como un POST directo (así
// funcionan las Server Actions de Next), por eso `submitQuote` vuelve a validar todo del lado del servidor sin
// confiar en nada de lo que ya validó el formulario en el navegador.
import { submitQuote, type SubmitQuoteResult } from "@/lib/quote-submit";

export type { SubmitQuoteResult };

export async function submitQuoteAction(state: unknown): Promise<SubmitQuoteResult> {
  return submitQuote(state);
}
