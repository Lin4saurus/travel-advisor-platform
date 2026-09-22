import type { ReactNode } from "react";
import { labelClass } from "@/components/ui/fields";

// Todos los campos del formulario de cotización se identifican por `name`; su `id` en la página es `quote-<name>`
// y el error de validación con esa misma clave se muestra junto al campo.
export function fieldId(name: string) {
  return `quote-${name}`;
}

function describedBy(name: string, hasHint: boolean, hasError: boolean) {
  const ids = [hasHint ? `${fieldId(name)}-hint` : "", hasError ? `${fieldId(name)}-error` : ""].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function Message({ name, hint, error }: { name: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${fieldId(name)}-hint`} className="mt-1 text-sm text-travel-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId(name)}-error`} className="mt-1 text-sm font-medium text-travel-danger">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </>
  );
}

type ControlProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

// Campo con una sola entrada (texto, número, fecha, selección): entrega al control los atributos de accesibilidad.
export function Field({
  name,
  label,
  optional,
  hint,
  error,
  children,
}: {
  name: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  return (
    <div>
      <label htmlFor={fieldId(name)} className={labelClass}>
        {label}
        {optional && <span className="font-normal text-travel-muted"> (opcional)</span>}
      </label>
      {children({
        id: fieldId(name),
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy(name, Boolean(hint), Boolean(error)),
      })}
      <Message name={name} hint={hint} error={error} />
    </div>
  );
}

// Grupo de opciones (radios o casillas) con leyenda. El `id` va en el <fieldset> para poder llevar el foco al primer control.
export function FieldGroup({
  name,
  legend,
  optional,
  hint,
  error,
  children,
}: {
  name: string;
  legend: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset id={fieldId(name)} aria-describedby={describedBy(name, Boolean(hint), Boolean(error))}>
      <legend className={labelClass}>
        {legend}
        {optional && <span className="font-normal text-travel-muted"> (opcional)</span>}
      </legend>
      {hint && (
        <p id={`${fieldId(name)}-hint`} className="mt-1 text-sm text-travel-muted">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${fieldId(name)}-error`} className="mt-2 text-sm font-medium text-travel-danger">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </fieldset>
  );
}

// Casilla o radio con su texto (el <label> envuelve al control, así todo el texto es clicable).
export function ChoiceRow({ children, card }: { children: ReactNode; card?: boolean }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 text-sm text-travel-text ${
        card
          ? "rounded-xl border border-travel-muted p-4 has-[:checked]:border-travel-primary has-[:checked]:bg-travel-surface has-[:checked]:ring-1 has-[:checked]:ring-travel-primary"
          : ""
      }`}
    >
      {children}
    </label>
  );
}

// Estilo de radios y casillas (el color del control sigue la paleta).
export const choiceInputClass = "mt-0.5 size-5 shrink-0 accent-travel-primary";
