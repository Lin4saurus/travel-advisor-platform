// Lógica pura del formulario de cotización: estado, validación por paso y resumen. Sin React ni datos de `data/`
// (el catálogo llega por parámetro), así se prueba aislada con los mismos módulos que usa la interfaz.
import {
  budgetProfiles,
  budgetTiers,
  contactMethods,
  quoteLimits,
  quoteSteps,
  requestTypes,
  serviceOptions,
  type BudgetProfile,
  type RequestType,
  type ServiceValue,
  type StepId,
} from "@/config/quote";
import { durationOptions } from "@/config/search";
import { formatDate, formatPrice } from "@/lib/format";

// Todo se guarda como texto (lo que hay en los campos) y se interpreta al validar: así no se pierde lo que la
// persona está escribiendo a medias.
export type QuoteState = {
  requestType: RequestType | "";
  // Slug del paquete / experiencia / evento elegido ("" = ninguno). Depende de `requestType`.
  itemSlug: string;
  destination: string;
  needsSuggestions: boolean;
  departureDate: string;
  returnDate: string;
  flexibleDates: boolean;
  duration: string;
  adults: string;
  children: string;
  childAges: string[];
  types: string[];
  services: ServiceValue[];
  notes: string;
  budgetProfile: string;
  budgetTier: string;
  budgetAmount: string;
  name: string;
  email: string;
  phone: string;
  contactMethod: string;
  acceptPrivacy: boolean;
};

// `destination`: texto para precargar el campo Destino al elegir el elemento. `types`: slugs de categorías de viaje
// (solo los paquetes los tienen).
export type CatalogItem = { slug: string; name: string; destination: string | null; types: string[] };

// Lo mínimo del catálogo que necesita el formulario (lo arma el servidor y lo recibe el componente).
export type QuoteCatalog = {
  packages: CatalogItem[];
  experiences: CatalogItem[];
  events: CatalogItem[];
  destinations: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
};

// Clave = campo con error; el `id` del elemento en la página es `quote-<clave>`.
export type QuoteErrors = Record<string, string>;

export type ValidationContext = {
  // Fecha local de hoy en formato AAAA-MM-DD (ver `localISODate`).
  today: string;
  catalog: QuoteCatalog;
};

export function emptyState(): QuoteState {
  return {
    requestType: "",
    itemSlug: "",
    destination: "",
    needsSuggestions: false,
    departureDate: "",
    returnDate: "",
    flexibleDates: false,
    duration: "",
    adults: "2",
    children: "0",
    childAges: [],
    types: [],
    services: [],
    notes: "",
    budgetProfile: budgetProfiles[0].id,
    budgetTier: "",
    budgetAmount: "",
    name: "",
    email: "",
    phone: "",
    contactMethod: contactMethods[0].value,
    acceptPrivacy: false,
  };
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// AAAA-MM-DD que además exista en el calendario (rechaza 2026-02-31).
export function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Fecha de hoy en la zona horaria de quien usa el formulario (no en UTC, para no adelantar el día).
export function localISODate(date: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Entero no negativo escrito con dígitos ("3"); cualquier otra cosa ("", "-1", "2.5", "1e3") es null.
export function parseCount(value: string) {
  const text = value.trim();
  return /^\d{1,3}$/.test(text) ? Number(text) : null;
}

// Ajusta la lista de edades a la cantidad de niños indicada (conserva las ya escritas). Una cantidad inválida o
// fuera de rango no genera casillas: el error lo muestra el campo "Niños" al validar.
export function syncChildAges(ages: string[], childrenText: string) {
  const count = parseCount(childrenText);
  const target = count === null || count > quoteLimits.maxChildren ? 0 : count;
  return Array.from({ length: target }, (_, index) => ages[index] ?? "");
}

export function stepIndex(id: StepId) {
  return quoteSteps.findIndex((step) => step.id === id);
}

function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, "");
}

export function validateStep(step: StepId, state: QuoteState, ctx: ValidationContext): QuoteErrors {
  const errors: QuoteErrors = {};
  const { today, catalog } = ctx;

  switch (step) {
    case "tipo": {
      if (!requestTypes.some((type) => type.value === state.requestType)) {
        errors.requestType = "Elige el tipo de solicitud.";
      }
      break;
    }

    case "destino": {
      const destination = state.destination.trim();
      if (!destination && !state.needsSuggestions) {
        errors.destination = "Indica un destino o marca «Necesito sugerencias».";
      } else if (destination.length > quoteLimits.maxText) {
        errors.destination = `El destino no puede superar ${quoteLimits.maxText} caracteres.`;
      }
      break;
    }

    case "fechas": {
      const { departureDate, returnDate, flexibleDates, duration } = state;
      if (departureDate && !isRealDate(departureDate)) {
        errors.departureDate = "La fecha de salida no es válida.";
      } else if (departureDate && departureDate < today) {
        errors.departureDate = "La fecha de salida no puede ser anterior a hoy.";
      } else if (!departureDate && !flexibleDates) {
        errors.departureDate =
          "Indica una fecha de salida o marca «Mis fechas son flexibles o aún no las tengo».";
      }

      if (returnDate) {
        if (!isRealDate(returnDate)) {
          errors.returnDate = "La fecha de regreso no es válida.";
        } else if (!departureDate) {
          errors.returnDate = "Indica primero la fecha de salida.";
        } else if (isRealDate(departureDate) && returnDate <= departureDate) {
          errors.returnDate = "La fecha de regreso debe ser posterior a la de salida.";
        }
      }

      if (duration && !durationOptions.some((option) => option.value === duration)) {
        errors.duration = "Elige una duración de la lista.";
      }
      break;
    }

    case "viajeros": {
      const adults = parseCount(state.adults);
      if (adults === null || adults < 1 || adults > quoteLimits.maxAdults) {
        errors.adults = `Indica cuántos adultos viajan: de 1 a ${quoteLimits.maxAdults}.`;
      }

      const children = parseCount(state.children);
      if (children === null || children > quoteLimits.maxChildren) {
        errors.children = `Indica cuántos niños viajan (0 si ninguno): máximo ${quoteLimits.maxChildren}.`;
      } else {
        for (let index = 0; index < children; index++) {
          const raw = (state.childAges[index] ?? "").trim();
          const age = parseCount(raw);
          if (!raw) {
            errors[`childAge-${index}`] = `Indica la edad del niño ${index + 1}.`;
          } else if (age === null || age > quoteLimits.maxChildAge) {
            errors[`childAge-${index}`] =
              `La edad del niño ${index + 1} debe ser un número entre 0 y ${quoteLimits.maxChildAge}.`;
          }
        }
      }
      break;
    }

    case "preferencias": {
      if (state.types.some((type) => !catalog.categories.some((category) => category.slug === type))) {
        errors.types = "Hay un tipo de viaje que no está en la lista.";
      }
      if (state.notes.length > quoteLimits.maxNotes) {
        errors.notes = `Los comentarios no pueden superar ${quoteLimits.maxNotes} caracteres.`;
      }
      break;
    }

    case "presupuesto": {
      if (!budgetProfiles.some((profile) => profile.id === state.budgetProfile)) {
        errors.budgetProfile = "Elige una moneda de la lista.";
      }
      if (!budgetTiers.some((tier) => tier.value === state.budgetTier)) {
        errors.budgetTier = "Elige un rango de presupuesto o «Aún no lo sé».";
      }
      const amount = state.budgetAmount.trim();
      if (amount && (!/^\d{1,9}$/.test(amount) || Number(amount) < 1)) {
        errors.budgetAmount = "Escribe solo números, sin puntos, comas ni símbolos.";
      }
      break;
    }

    case "contacto": {
      const name = state.name.trim();
      if (name.length < 2) {
        errors.name = "Escribe tu nombre completo.";
      } else if (name.length > quoteLimits.maxText) {
        errors.name = `El nombre no puede superar ${quoteLimits.maxText} caracteres.`;
      }

      const email = state.email.trim();
      if (!email) {
        errors.email = "Escribe tu correo electrónico.";
      } else if (!EMAIL_PATTERN.test(email) || email.length > quoteLimits.maxEmail) {
        errors.email = "Revisa el formato del correo (por ejemplo, nombre@dominio.com).";
      }

      const phone = state.phone.trim();
      if (!phone) {
        errors.phone = "Escribe tu teléfono.";
      } else if (!/^\+?\d{7,15}$/.test(normalizePhone(phone))) {
        errors.phone = "Revisa el teléfono: de 7 a 15 dígitos, puede empezar con + (por ejemplo, +591 70000000).";
      }

      if (!contactMethods.some((method) => method.value === state.contactMethod)) {
        errors.contactMethod = "Elige cómo prefieres que te contactemos.";
      }
      break;
    }

    case "confirmacion": {
      if (!state.acceptPrivacy) {
        errors.acceptPrivacy = "Debes aceptar la política de privacidad para continuar.";
      }
      break;
    }
  }

  return errors;
}

// Valida los ocho pasos y devuelve el primero con errores (para llevar a la persona a corregirlo).
export function validateAll(state: QuoteState, ctx: ValidationContext) {
  for (const step of quoteSteps) {
    const errors = validateStep(step.id, state, ctx);
    if (Object.keys(errors).length > 0) return { step: step.id, errors };
  }
  return null;
}

// Texto de un rango de presupuesto: su nombre y, solo si el perfil define montos, el intervalo.
export function budgetTierLabel(profile: BudgetProfile, tier: string) {
  const base = budgetTiers.find((option) => option.value === tier)?.label ?? tier;
  const amounts = profile.amounts[tier];
  if (!amounts) return base;
  const { min, max } = amounts;
  const money = (amount: number) => formatPrice({ amount, currency: profile.currency });

  let range: string;
  if (min !== null && max !== null) range = `de ${money(min)} a ${money(max)}`;
  else if (max !== null) range = `hasta ${money(max)}`;
  else if (min !== null) range = `desde ${money(min)}`;
  else return base;

  return `${base} (${range}${profile.basis ? ` ${profile.basis}` : ""})`;
}

export type SummaryRow = { label: string; value: string };
export type SummarySection = { step: StepId; title: string; rows: SummaryRow[] };

const NOT_SET = "No indicado";

function itemLabel(type: RequestType | "") {
  if (type === "paquete") return "Paquete";
  if (type === "experiencia") return "Experiencia";
  if (type === "evento") return "Evento";
  return null;
}

export function itemsFor(type: RequestType | "", catalog: QuoteCatalog): CatalogItem[] {
  if (type === "paquete") return catalog.packages;
  if (type === "experiencia") return catalog.experiences;
  if (type === "evento") return catalog.events;
  return [];
}

// Todo lo que la persona eligió, agrupado por paso, para mostrarlo antes de finalizar.
export function buildSummary(state: QuoteState, catalog: QuoteCatalog): SummarySection[] {
  const title = (id: StepId) => quoteSteps.find((step) => step.id === id)?.title ?? id;
  const profile = budgetProfiles.find((item) => item.id === state.budgetProfile) ?? budgetProfiles[0];

  const destination = state.destination.trim();
  const destinationValue = state.needsSuggestions
    ? destination
      ? `${destination} (y necesito sugerencias)`
      : "Necesito sugerencias"
    : destination || NOT_SET;

  const destinationRows: SummaryRow[] = [{ label: "Destino", value: destinationValue }];
  const label = itemLabel(state.requestType);
  const item = itemsFor(state.requestType, catalog).find((candidate) => candidate.slug === state.itemSlug);
  if (label) destinationRows.push({ label, value: item ? item.name : "Sin elegir" });

  const childCount = parseCount(state.children) ?? 0;
  const ages = state.childAges.slice(0, childCount).map((age) => age.trim());
  const durationLabel = durationOptions.find((option) => option.value === state.duration)?.label;

  const dateRows: SummaryRow[] = [
    { label: "Salida", value: state.departureDate && isRealDate(state.departureDate) ? formatDate(state.departureDate) : NOT_SET },
    { label: "Regreso", value: state.returnDate && isRealDate(state.returnDate) ? formatDate(state.returnDate) : NOT_SET },
  ];
  if (durationLabel) dateRows.push({ label: "Duración aproximada", value: durationLabel });
  if (state.flexibleDates) dateRows.push({ label: "Fechas", value: "Flexibles o aún sin definir" });

  const amount = state.budgetAmount.trim();

  return [
    {
      step: "tipo",
      title: title("tipo"),
      rows: [
        {
          label: "Solicitud",
          value: requestTypes.find((type) => type.value === state.requestType)?.label ?? NOT_SET,
        },
      ],
    },
    { step: "destino", title: title("destino"), rows: destinationRows },
    { step: "fechas", title: title("fechas"), rows: dateRows },
    {
      step: "viajeros",
      title: title("viajeros"),
      rows: [
        { label: "Adultos", value: state.adults.trim() || NOT_SET },
        { label: "Niños", value: childCount === 0 ? "0" : `${childCount} (edades: ${ages.map((age) => age || "?").join(", ")})` },
      ],
    },
    {
      step: "preferencias",
      title: title("preferencias"),
      rows: [
        {
          label: "Tipos de viaje",
          value:
            state.types
              .map((slug) => catalog.categories.find((category) => category.slug === slug)?.name ?? slug)
              .join(", ") || "Sin preferencia",
        },
        {
          label: "Quiero que incluya",
          value:
            state.services
              .map((value) => serviceOptions.find((option) => option.value === value)?.label ?? value)
              .join(", ") || "Sin preferencia",
        },
        { label: "Comentarios", value: state.notes.trim() || "Sin comentarios" },
      ],
    },
    {
      step: "presupuesto",
      title: title("presupuesto"),
      rows: [
        { label: "Moneda", value: profile.label },
        { label: "Rango", value: state.budgetTier ? budgetTierLabel(profile, state.budgetTier) : NOT_SET },
        {
          label: "Monto aproximado",
          value: amount && /^\d{1,9}$/.test(amount) ? formatPrice({ amount: Number(amount), currency: profile.currency }) : NOT_SET,
        },
      ],
    },
    {
      step: "contacto",
      title: title("contacto"),
      rows: [
        { label: "Nombre", value: state.name.trim() || NOT_SET },
        { label: "Correo", value: state.email.trim() || NOT_SET },
        { label: "Teléfono", value: state.phone.trim() || NOT_SET },
        {
          label: "Contacto preferido",
          value: contactMethods.find((method) => method.value === state.contactMethod)?.label ?? NOT_SET,
        },
      ],
    },
  ];
}
