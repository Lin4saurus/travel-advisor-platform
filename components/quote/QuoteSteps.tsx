"use client";

import Link from "next/link";
import { ChoiceRow, Field, FieldGroup, choiceInputClass } from "@/components/quote/Field";
import QuoteSummary from "@/components/quote/QuoteSummary";
import { fieldClass } from "@/components/ui/fields";
import {
  budgetProfiles,
  budgetTiers,
  contactMethods,
  quoteLimits,
  requestTypes,
  serviceOptions,
  type RequestType,
} from "@/config/quote";
import { durationOptions } from "@/config/search";
import {
  budgetTierLabel,
  itemsFor,
  syncChildAges,
  type QuoteCatalog,
  type QuoteErrors,
  type QuoteState,
  type SummarySection,
} from "@/lib/quote";

// Cada paso recibe el estado, sus errores y dos funciones para cambiarlo: `patch` aplica cambios y limpia los errores
// de las claves indicadas (el error de un campo desaparece cuando la persona lo edita).
export type StepProps = {
  state: QuoteState;
  errors: QuoteErrors;
  catalog: QuoteCatalog;
  patch: (partial: Partial<QuoteState>, clearErrors?: string[]) => void;
};

const textareaClass =
  "mt-1 block min-h-28 w-full rounded-lg border border-travel-muted bg-travel-background px-3 py-2 text-base text-travel-text placeholder:text-travel-muted";

const itemNouns: Partial<Record<RequestType, string>> = {
  paquete: "Paquete de interés",
  experiencia: "Experiencia de interés",
  evento: "Evento de interés",
};

export function TipoStep({ state, errors, patch }: StepProps) {
  return (
    <FieldGroup name="requestType" legend="¿Qué quieres cotizar?" error={errors.requestType}>
      <div className="grid gap-3 sm:grid-cols-2">
        {requestTypes.map((type) => (
          <ChoiceRow key={type.value} card>
            <input
              type="radio"
              name="requestType"
              value={type.value}
              checked={state.requestType === type.value}
              onChange={() =>
                patch(
                  {
                    requestType: type.value,
                    // Cada tipo tiene su propia lista: si cambia, la selección anterior ya no aplica.
                    itemSlug: "",
                  },
                  ["requestType"],
                )
              }
              className={choiceInputClass}
            />
            <span className="block">
              <span className="block font-medium">{type.label}</span>
              <span className="mt-0.5 block text-travel-muted">{type.description}</span>
            </span>
          </ChoiceRow>
        ))}
      </div>
    </FieldGroup>
  );
}

export function DestinoStep({ state, errors, catalog, patch }: StepProps) {
  const items = itemsFor(state.requestType, catalog);
  const noun = state.requestType ? itemNouns[state.requestType] : undefined;

  function handleItemChange(slug: string) {
    const previous = items.find((item) => item.slug === state.itemSlug);
    const next = items.find((item) => item.slug === slug);
    const partial: Partial<QuoteState> = { itemSlug: slug };
    // Se sugiere el destino del elemento, salvo que la persona ya haya escrito otro.
    if (next?.destination && (!state.destination.trim() || state.destination === previous?.destination)) {
      partial.destination = next.destination;
    }
    patch(partial, ["destination"]);
  }

  return (
    <div className="space-y-6">
      {noun && (
        <Field name="itemSlug" label={noun} optional hint="Si aún no sabes cuál, déjalo sin elegir.">
          {(control) => (
            <select
              {...control}
              value={state.itemSlug}
              onChange={(event) => handleItemChange(event.target.value)}
              className={fieldClass}
            >
              <option value="">Sin elegir</option>
              {items.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}

      <Field name="destination" label="Destino" error={errors.destination}>
        {(control) => (
          <>
            <input
              {...control}
              type="text"
              list="quote-destination-list"
              autoComplete="off"
              placeholder="¿A dónde quieres ir?"
              value={state.destination}
              onChange={(event) => patch({ destination: event.target.value }, ["destination"])}
              className={fieldClass}
            />
            <datalist id="quote-destination-list">
              {catalog.destinations.map((destination) => (
                <option key={destination.slug} value={destination.name} />
              ))}
            </datalist>
          </>
        )}
      </Field>

      <ChoiceRow>
        <input
          type="checkbox"
          checked={state.needsSuggestions}
          onChange={(event) => patch({ needsSuggestions: event.target.checked }, ["destination"])}
          className={choiceInputClass}
        />
        <span>Necesito sugerencias de destino</span>
      </ChoiceRow>
    </div>
  );
}

export function FechasStep({ state, errors, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="departureDate" label="Fecha de salida" error={errors.departureDate}>
          {(control) => (
            <input
              {...control}
              type="date"
              value={state.departureDate}
              onChange={(event) => patch({ departureDate: event.target.value }, ["departureDate", "returnDate"])}
              className={fieldClass}
            />
          )}
        </Field>
        <Field name="returnDate" label="Fecha de regreso" optional error={errors.returnDate}>
          {(control) => (
            <input
              {...control}
              type="date"
              value={state.returnDate}
              onChange={(event) => patch({ returnDate: event.target.value }, ["returnDate"])}
              className={fieldClass}
            />
          )}
        </Field>
      </div>

      <Field
        name="duration"
        label="Duración aproximada"
        optional
        hint="Útil si todavía no tienes fecha de regreso."
        error={errors.duration}
      >
        {(control) => (
          <select
            {...control}
            value={state.duration}
            onChange={(event) => patch({ duration: event.target.value }, ["duration"])}
            className={fieldClass}
          >
            <option value="">Sin indicar</option>
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <ChoiceRow>
        <input
          type="checkbox"
          checked={state.flexibleDates}
          onChange={(event) => patch({ flexibleDates: event.target.checked }, ["departureDate"])}
          className={choiceInputClass}
        />
        <span>Mis fechas son flexibles o aún no las tengo</span>
      </ChoiceRow>
    </div>
  );
}

export function ViajerosStep({ state, errors, patch }: StepProps) {
  const ageKeys = Object.keys(errors).filter((key) => key.startsWith("childAge-"));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="adults" label="Adultos" hint="Mayores de 17 años." error={errors.adults}>
          {(control) => (
            <input
              {...control}
              type="number"
              inputMode="numeric"
              min={1}
              max={quoteLimits.maxAdults}
              value={state.adults}
              onChange={(event) => patch({ adults: event.target.value }, ["adults"])}
              className={fieldClass}
            />
          )}
        </Field>
        <Field name="children" label="Niños" hint="De 0 a 17 años." error={errors.children}>
          {(control) => (
            <input
              {...control}
              type="number"
              inputMode="numeric"
              min={0}
              max={quoteLimits.maxChildren}
              value={state.children}
              onChange={(event) =>
                patch(
                  { children: event.target.value, childAges: syncChildAges(state.childAges, event.target.value) },
                  ["children", ...ageKeys],
                )
              }
              className={fieldClass}
            />
          )}
        </Field>
      </div>

      {state.childAges.length > 0 && (
        <FieldGroup name="childAges" legend="Edad de cada niño" hint="Edad al momento del viaje, de 0 a 17 años.">
          <div className="grid gap-4 sm:grid-cols-3">
            {state.childAges.map((age, index) => (
              <Field key={index} name={`childAge-${index}`} label={`Niño ${index + 1}`} error={errors[`childAge-${index}`]}>
                {(control) => (
                  <input
                    {...control}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={quoteLimits.maxChildAge}
                    value={age}
                    onChange={(event) => {
                      const ages = [...state.childAges];
                      ages[index] = event.target.value;
                      patch({ childAges: ages }, [`childAge-${index}`]);
                    }}
                    className={fieldClass}
                  />
                )}
              </Field>
            ))}
          </div>
        </FieldGroup>
      )}
    </div>
  );
}

function toggle<T>(list: T[], value: T, checked: boolean) {
  return checked ? (list.includes(value) ? list : [...list, value]) : list.filter((item) => item !== value);
}

export function PreferenciasStep({ state, errors, catalog, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <FieldGroup name="types" legend="Tipo de viaje" optional hint="Elige los que te interesen." error={errors.types}>
        <div className="grid gap-3 sm:grid-cols-2">
          {catalog.categories.map((category) => (
            <ChoiceRow key={category.slug}>
              <input
                type="checkbox"
                checked={state.types.includes(category.slug)}
                onChange={(event) =>
                  patch({ types: toggle(state.types, category.slug, event.target.checked) }, ["types"])
                }
                className={choiceInputClass}
              />
              <span>{category.name}</span>
            </ChoiceRow>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup name="services" legend="Quiero que incluya" optional>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {serviceOptions.map((service) => (
            <ChoiceRow key={service.value}>
              <input
                type="checkbox"
                checked={state.services.includes(service.value)}
                onChange={(event) =>
                  patch({ services: toggle(state.services, service.value, event.target.checked) })
                }
                className={choiceInputClass}
              />
              <span>{service.label}</span>
            </ChoiceRow>
          ))}
        </div>
      </FieldGroup>

      <Field
        name="notes"
        label="Comentarios"
        optional
        hint="Cuéntanos lo que quieras que tengamos en cuenta: intereses, ocasión especial, necesidades de movilidad…"
        error={errors.notes}
      >
        {(control) => (
          <textarea
            {...control}
            value={state.notes}
            onChange={(event) => patch({ notes: event.target.value }, ["notes"])}
            className={textareaClass}
          />
        )}
      </Field>
    </div>
  );
}

export function PresupuestoStep({ state, errors, patch }: StepProps) {
  const profile = budgetProfiles.find((item) => item.id === state.budgetProfile) ?? budgetProfiles[0];

  return (
    <div className="space-y-6">
      <FieldGroup name="budgetProfile" legend="Moneda" error={errors.budgetProfile}>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {budgetProfiles.map((item) => (
            <ChoiceRow key={item.id}>
              <input
                type="radio"
                name="budgetProfile"
                value={item.id}
                checked={state.budgetProfile === item.id}
                onChange={() => patch({ budgetProfile: item.id }, ["budgetProfile"])}
                className={choiceInputClass}
              />
              <span>{item.label}</span>
            </ChoiceRow>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup name="budgetTier" legend="Rango de presupuesto" error={errors.budgetTier}>
        <div className="grid gap-3 sm:grid-cols-2">
          {budgetTiers.map((tier) => (
            <ChoiceRow key={tier.value} card>
              <input
                type="radio"
                name="budgetTier"
                value={tier.value}
                checked={state.budgetTier === tier.value}
                onChange={() => patch({ budgetTier: tier.value }, ["budgetTier"])}
                className={choiceInputClass}
              />
              <span className="font-medium">{budgetTierLabel(profile, tier.value)}</span>
            </ChoiceRow>
          ))}
        </div>
      </FieldGroup>

      <Field
        name="budgetAmount"
        label={`Monto aproximado (${profile.currency})`}
        optional
        hint="Solo números, sin puntos ni comas."
        error={errors.budgetAmount}
      >
        {(control) => (
          <input
            {...control}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={state.budgetAmount}
            onChange={(event) => patch({ budgetAmount: event.target.value }, ["budgetAmount"])}
            className={fieldClass}
          />
        )}
      </Field>
    </div>
  );
}

export function ContactoStep({ state, errors, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <Field name="name" label="Nombre completo" error={errors.name}>
        {(control) => (
          <input
            {...control}
            type="text"
            autoComplete="name"
            value={state.name}
            onChange={(event) => patch({ name: event.target.value }, ["name"])}
            className={fieldClass}
          />
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="email" label="Correo electrónico" error={errors.email}>
          {(control) => (
            <input
              {...control}
              type="email"
              autoComplete="email"
              placeholder="nombre@dominio.com"
              value={state.email}
              onChange={(event) => patch({ email: event.target.value }, ["email"])}
              className={fieldClass}
            />
          )}
        </Field>
        <Field name="phone" label="Teléfono" error={errors.phone}>
          {(control) => (
            <input
              {...control}
              type="tel"
              autoComplete="tel"
              placeholder="+591 70000000"
              value={state.phone}
              onChange={(event) => patch({ phone: event.target.value }, ["phone"])}
              className={fieldClass}
            />
          )}
        </Field>
      </div>

      <FieldGroup name="contactMethod" legend="¿Cómo prefieres que te contactemos?" error={errors.contactMethod}>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {contactMethods.map((method) => (
            <ChoiceRow key={method.value}>
              <input
                type="radio"
                name="contactMethod"
                value={method.value}
                checked={state.contactMethod === method.value}
                onChange={() => patch({ contactMethod: method.value }, ["contactMethod"])}
                className={choiceInputClass}
              />
              <span>{method.label}</span>
            </ChoiceRow>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

export function ConfirmacionStep({
  state,
  errors,
  patch,
  sections,
  onEdit,
}: StepProps & { sections: SummarySection[]; onEdit: (section: SummarySection) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-travel-muted">Revisa tu solicitud. Puedes editar cualquier sección antes de finalizar.</p>
      <QuoteSummary sections={sections} onEdit={onEdit} />

      <div className="rounded-xl bg-travel-accent-light p-4 text-sm text-travel-text">
        <p className="font-semibold">Antes de finalizar</p>
        <p className="mt-1">
          Este formulario todavía no está conectado a un canal de recepción: al finalizar no se guarda ni se envía
          ninguna información.
        </p>
      </div>

      <div>
        <ChoiceRow>
          <input
            id="quote-acceptPrivacy"
            type="checkbox"
            checked={state.acceptPrivacy}
            aria-invalid={Boolean(errors.acceptPrivacy)}
            aria-describedby={errors.acceptPrivacy ? "quote-acceptPrivacy-error" : undefined}
            onChange={(event) => patch({ acceptPrivacy: event.target.checked }, ["acceptPrivacy"])}
            className={choiceInputClass}
          />
          <span>
            He leído la{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-travel-primary underline underline-offset-2"
            >
              política de privacidad<span className="sr-only"> (se abre en otra pestaña)</span>
            </Link>{" "}
            y acepto que Mundo Viajero use mis datos para responder a esta solicitud.
          </span>
        </ChoiceRow>
        {errors.acceptPrivacy && (
          <p id="quote-acceptPrivacy-error" className="mt-2 text-sm font-medium text-travel-danger">
            <span className="sr-only">Error: </span>
            {errors.acceptPrivacy}
          </p>
        )}
      </div>
    </div>
  );
}
