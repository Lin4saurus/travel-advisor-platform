"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import QuoteSummary from "@/components/quote/QuoteSummary";
import {
  ConfirmacionStep,
  ContactoStep,
  DestinoStep,
  FechasStep,
  PreferenciasStep,
  PresupuestoStep,
  TipoStep,
  ViajerosStep,
  type StepProps,
} from "@/components/quote/QuoteSteps";
import { fieldId } from "@/components/quote/Field";
import { buttonStyles } from "@/components/ui/buttons";
import { quoteSteps } from "@/config/quote";
import {
  buildSummary,
  localISODate,
  stepIndex,
  validateAll,
  validateStep,
  type QuoteCatalog,
  type QuoteErrors,
  type QuoteState,
} from "@/lib/quote";

type FocusRequest = { target: "heading" | "errors"; n: number };

// Formulario de cotización de 8 pasos. Todo vive en memoria: nada se guarda en el navegador ni en un servidor
// (todavía no hay canal de recepción; ver el aviso del último paso y el panel final).
export default function QuoteStepper({
  catalog,
  initialState,
}: {
  catalog: QuoteCatalog;
  initialState: QuoteState;
}) {
  const [state, setState] = useState<QuoteState>(initialState);
  const [step, setStep] = useState(0);
  // Paso más lejano al que se llegó avanzando (los siguientes no se pueden saltar desde el indicador de progreso).
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [completed, setCompleted] = useState(false);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorsRef = useRef<HTMLDivElement>(null);

  // Mueve el foco (y la vista) al título del paso o al resumen de errores, después de que React pinte el cambio.
  useEffect(() => {
    if (!focusRequest) return;
    const element = focusRequest.target === "errors" ? errorsRef.current : headingRef.current;
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: "start" });
  }, [focusRequest]);

  function requestFocus(target: FocusRequest["target"]) {
    setFocusRequest((previous) => ({ target, n: (previous?.n ?? 0) + 1 }));
  }

  function context() {
    return { today: localISODate(), catalog };
  }

  function patch(partial: Partial<QuoteState>, clearErrors: string[] = []) {
    setState((previous) => ({ ...previous, ...partial }));
    if (clearErrors.length > 0) {
      setErrors((previous) => {
        const next = { ...previous };
        for (const key of clearErrors) delete next[key];
        return next;
      });
    }
  }

  function showErrors(next: QuoteErrors) {
    setErrors(next);
    requestFocus("errors");
  }

  function goTo(target: number) {
    if (target === step) return;
    if (target > step) {
      // Para avanzar hay que dejar bien el paso actual.
      const found = validateStep(quoteSteps[step].id, state, context());
      if (Object.keys(found).length > 0) return showErrors(found);
      setMaxReached((previous) => Math.max(previous, target));
    }
    setStep(target);
    setErrors({});
    requestFocus("heading");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < quoteSteps.length - 1) return goTo(step + 1);

    // Último paso: se vuelven a validar los ocho por si algo se editó después de pasarlo.
    const problem = validateAll(state, context());
    if (problem) {
      setMaxReached((previous) => Math.max(previous, stepIndex(problem.step)));
      setStep(stepIndex(problem.step));
      return showErrors(problem.errors);
    }
    setErrors({});
    setCompleted(true);
    requestFocus("heading");
  }

  // Lleva el foco al campo con error (el resumen de errores lo usa para cada mensaje).
  function focusField(key: string) {
    const element = document.getElementById(fieldId(key));
    const target = element?.tagName === "FIELDSET" ? element.querySelector<HTMLElement>("input, select, textarea") : element;
    target?.focus();
  }

  const summary = buildSummary(state, catalog);
  const stepProps: StepProps = { state, errors, catalog, patch };
  const current = quoteSteps[step];
  const errorEntries = Object.entries(errors);

  if (completed) {
    return (
      <div className="rounded-2xl border border-travel-border bg-travel-background p-5 shadow-sm sm:p-8">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-24 text-2xl font-semibold tracking-tight text-travel-primary-dark"
        >
          Tu solicitud está completa
        </h2>
        <p className="mt-3 text-travel-text">
          Revisamos que todos los datos estén bien. Todavía no hay un canal de recepción conectado, por eso tu
          solicitud <strong>no se guardó ni se envió</strong>: cuando esté habilitado podrás enviarla desde aquí.
        </p>
        <div className="mt-6">
          <QuoteSummary sections={summary} />
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setCompleted(false);
              requestFocus("heading");
            }}
            className={buttonStyles.outline}
          >
            Volver a editar
          </button>
          <Link href="/" className={buttonStyles.secondary}>
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isLast = step === quoteSteps.length - 1;

  return (
    <div className="rounded-2xl border border-travel-border bg-travel-background p-5 shadow-sm sm:p-8">
      <nav aria-label="Progreso de la solicitud">
        <p className="text-sm font-medium text-travel-muted md:hidden">
          Paso {step + 1} de {quoteSteps.length}: {current.title}
        </p>
        <ol className="hidden items-start gap-2 md:flex">
          {quoteSteps.map((item, index) => {
            const isCurrent = index === step;
            const reachable = index <= maxReached;
            const circle = `flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
              isCurrent
                ? "border-travel-primary bg-travel-primary text-white"
                : reachable
                  ? "border-travel-primary bg-travel-background text-travel-primary"
                  : "border-travel-muted bg-travel-background text-travel-muted"
            }`;
            const title = <span className="sr-only text-xs lg:not-sr-only">{item.title}</span>;
            return (
              <li key={item.id} className="flex flex-1 flex-col items-center gap-1 text-center lg:items-center">
                {reachable && !isCurrent ? (
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Ir al paso ${index + 1}: ${item.title}`}
                    className="flex flex-col items-center gap-1 rounded-md text-travel-primary"
                  >
                    <span className={circle}>{index + 1}</span>
                    {title}
                  </button>
                ) : (
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex flex-col items-center gap-1 ${isCurrent ? "font-semibold text-travel-primary-dark" : "text-travel-muted"}`}
                  >
                    <span className={circle}>{index + 1}</span>
                    {title}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <div aria-hidden="true" className="mt-4 h-1.5 overflow-hidden rounded-full bg-travel-border">
          <div
            className="h-full rounded-full bg-travel-primary transition-all"
            style={{ width: `${((step + 1) / quoteSteps.length) * 100}%` }}
          />
        </div>
      </nav>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-24 text-2xl font-semibold tracking-tight text-travel-primary-dark"
        >
          <span className="sr-only">Paso {step + 1} de {quoteSteps.length}: </span>
          {current.title}
        </h2>

        {errorEntries.length > 0 && (
          <div
            ref={errorsRef}
            role="alert"
            tabIndex={-1}
            className="mt-4 scroll-mt-24 rounded-xl border border-travel-danger bg-travel-background p-4"
          >
            <p className="font-semibold text-travel-danger">
              {errorEntries.length === 1
                ? "Revisa este campo para continuar:"
                : `Revisa estos ${errorEntries.length} campos para continuar:`}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-travel-text">
              {errorEntries.map(([key, message]) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => focusField(key)}
                    className="rounded-sm py-1 text-left underline underline-offset-2"
                  >
                    {message}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          {current.id === "tipo" && <TipoStep {...stepProps} />}
          {current.id === "destino" && <DestinoStep {...stepProps} />}
          {current.id === "fechas" && <FechasStep {...stepProps} />}
          {current.id === "viajeros" && <ViajerosStep {...stepProps} />}
          {current.id === "preferencias" && <PreferenciasStep {...stepProps} />}
          {current.id === "presupuesto" && <PresupuestoStep {...stepProps} />}
          {current.id === "contacto" && <ContactoStep {...stepProps} />}
          {current.id === "confirmacion" && (
            <ConfirmacionStep
              {...stepProps}
              sections={summary}
              onEdit={(section) => goTo(stepIndex(section.step))}
            />
          )}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => goTo(step - 1)} className={buttonStyles.outline}>
              Anterior
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className={buttonStyles.secondary}>
            {isLast ? "Finalizar solicitud" : "Siguiente"}
          </button>
        </div>
      </form>
    </div>
  );
}
