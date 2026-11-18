"use client";

import { useActionState } from "react";
import { saveCatalogItemAction, type CatalogFormState } from "@/app/admin/catalog-actions";
import { buttonStyles } from "@/components/ui/buttons";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { formSections, type FieldDef, type FormValues } from "@/lib/catalog/forms";
import type { CatalogKind } from "@/lib/catalog/normalize";

type Option = { value: string; label: string };

type Props = {
  kind: CatalogKind;
  initialValues: FormValues;
  // Solo al editar: el identificador ya no se puede cambiar.
  originalSlug?: string;
  destinationOptions: Option[];
};

const textareaClass = `${fieldClass} h-auto py-2 leading-relaxed`;

function Field({
  field,
  value,
  error,
  destinationOptions,
  lockedSlug,
}: {
  field: FieldDef;
  value: string | string[] | undefined;
  error?: string;
  destinationOptions: Option[];
  lockedSlug?: string;
}) {
  const id = `cat-${field.name}`;
  const describedBy = [field.hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const text = typeof value === "string" ? value : "";
  const hint = field.hint && (
    <p id={`${id}-hint`} className="mt-1 text-xs text-travel-muted">
      {field.hint}
    </p>
  );
  const errorText = error && (
    <p id={`${id}-error`} className="mt-1 text-sm text-travel-danger">
      {error}
    </p>
  );
  const common = { id, name: field.name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy };

  if (field.name === "slug" && lockedSlug) {
    return (
      <div>
        <span className={labelClass}>{field.label}</span>
        <p className="mt-1 rounded-lg bg-travel-surface px-3 py-2.5 font-mono text-sm text-travel-text">{lockedSlug}</p>
        <p className="mt-1 text-xs text-travel-muted">No se puede cambiar: rompería los enlaces y las cotizaciones que lo mencionan.</p>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div>
        <label className="inline-flex min-h-9 items-center gap-3 text-sm font-medium text-travel-text">
          <input type="checkbox" {...common} defaultChecked={text === "on"} className="size-6 accent-travel-primary" />
          {field.label}
        </label>
        {hint}
        {errorText}
      </div>
    );
  }

  if (field.type === "checkboxes") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset aria-describedby={describedBy}>
        <legend className={labelClass}>{field.label}</legend>
        <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
          {(field.options ?? []).map((option) => (
            <label key={option.value} className="inline-flex min-h-9 items-center gap-3 text-sm text-travel-text">
              <input
                type="checkbox"
                name={field.name}
                value={option.value}
                defaultChecked={selected.includes(option.value)}
                className="size-6 accent-travel-primary"
              />
              {option.label}
            </label>
          ))}
        </div>
        {hint}
        {errorText}
      </fieldset>
    );
  }

  let control;
  if (field.type === "select") {
    const options = field.dynamicOptions === "destinations"
      ? [{ value: "", label: "Ninguno" }, ...destinationOptions]
      : (field.options ?? []);
    control = (
      <select {...common} defaultValue={text} className={fieldClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "textarea" || field.type === "lines" || field.type === "blocks") {
    control = (
      <textarea
        {...common}
        defaultValue={text}
        rows={field.rows ?? 3}
        maxLength={field.type === "textarea" ? field.maxLength : undefined}
        className={textareaClass}
      />
    );
  } else {
    control = (
      <input
        {...common}
        type={field.type === "number" ? "text" : field.type}
        inputMode={field.type === "number" ? "decimal" : undefined}
        defaultValue={text}
        required={field.required}
        maxLength={field.maxLength}
        className={fieldClass}
      />
    );
  }

  return (
    <div className={field.type === "textarea" || field.type === "lines" || field.type === "blocks" ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className={labelClass}>
        {field.label}
        {field.required && <span className="text-travel-danger"> *</span>}
      </label>
      {control}
      {hint}
      {errorText}
    </div>
  );
}

export default function CatalogForm({ kind, initialValues, originalSlug, destinationOptions }: Props) {
  const [state, formAction, pending] = useActionState<CatalogFormState, FormData>(saveCatalogItemAction, {
    values: initialValues,
    errors: {},
    message: null,
    attempt: 0,
  });
  const editing = Boolean(originalSlug);

  return (
    <form action={formAction} noValidate className="space-y-6">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="originalSlug" value={originalSlug ?? ""} />

      {/* `key` cambia en cada intento: React limpia el formulario tras la acción, así se vuelve a pintar con lo
          que se envió (y sus errores) en vez de perder lo escrito. */}
      <div key={state.attempt} className="space-y-6">
        {formSections[kind].map((section) => (
          <fieldset key={section.title} className="rounded-xl border border-travel-border bg-travel-background p-5">
            <legend className="px-1 text-lg font-semibold text-travel-text">{section.title}</legend>
            <div className="mt-2 grid gap-5 sm:grid-cols-2">
              {section.fields.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={state.values[field.name]}
                  error={state.errors[field.name]}
                  destinationOptions={destinationOptions}
                  lockedSlug={originalSlug}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-travel-border bg-travel-surface/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        {editing ? (
          <button type="submit" name="intent" value="save" disabled={pending} className={`${buttonStyles.secondary} disabled:opacity-60`}>
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
        ) : (
          <>
            <button type="submit" name="intent" value="publish" disabled={pending} className={`${buttonStyles.secondary} disabled:opacity-60`}>
              {pending ? "Guardando…" : "Guardar y publicar"}
            </button>
            <button type="submit" name="intent" value="draft" disabled={pending} className={`${buttonStyles.outline} disabled:opacity-60`}>
              Guardar sin publicar
            </button>
          </>
        )}
        <p role="alert" aria-live="assertive" className="text-sm text-travel-danger">
          {state.message}
        </p>
      </div>
    </form>
  );
}
