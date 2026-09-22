// Configuración editable del formulario de cotización (`/quote`). Nada de esto son datos del negocio "verificables":
// son opciones del formulario. Lo que el negocio deba definir (montos de presupuesto) queda vacío a propósito.
import { budgetOptions } from "@/config/search";

export type RequestType = "a-medida" | "paquete" | "experiencia" | "evento";

export const requestTypes: { value: RequestType; label: string; description: string }[] = [
  {
    value: "a-medida",
    label: "Viaje a medida",
    description: "Armamos una propuesta según tus ideas, fechas y presupuesto.",
  },
  {
    value: "paquete",
    label: "Un paquete del catálogo",
    description: "Quieres cotizar un paquete que viste en el sitio.",
  },
  {
    value: "experiencia",
    label: "Una experiencia o excursión",
    description: "Quieres sumar una actividad o excursión a tu viaje.",
  },
  {
    value: "evento",
    label: "Un evento o concierto",
    description: "Quieres viajar para asistir a un evento.",
  },
];

// Los ocho pasos, en orden. `id` es interno; `title` es lo que ve la persona.
export const quoteSteps = [
  { id: "tipo", title: "Tipo de solicitud" },
  { id: "destino", title: "Destino" },
  { id: "fechas", title: "Fechas" },
  { id: "viajeros", title: "Viajeros" },
  { id: "preferencias", title: "Preferencias" },
  { id: "presupuesto", title: "Presupuesto" },
  { id: "contacto", title: "Contacto" },
  { id: "confirmacion", title: "Confirmación" },
] as const;

export type StepId = (typeof quoteSteps)[number]["id"];

// Límites de validación.
export const quoteLimits = {
  maxAdults: 50,
  maxChildren: 20,
  maxChildAge: 17,
  maxText: 80,
  maxEmail: 254,
  maxNotes: 1000,
};

export const serviceOptions = [
  { value: "flights", label: "Vuelos" },
  { value: "transfers", label: "Traslados" },
  { value: "excursions", label: "Excursiones" },
] as const;

export type ServiceValue = (typeof serviceOptions)[number]["value"];

// Cómo prefiere la persona que la contacten. Solo canales que el negocio pueda atender: agregar/quitar aquí.
export const contactMethods: { value: string; label: string }[] = [
  { value: "email", label: "Correo electrónico" },
  { value: "phone", label: "Llamada telefónica" },
];

// Presupuesto por país/moneda. Los rangos (`value`) y sus nombres salen de `config/search.ts` (`budgetOptions`, los
// mismos que usa el buscador de paquetes). `amounts` agrega montos a un rango de un perfil: mientras un rango no tenga
// montos, el formulario muestra solo su nombre (sin cifras inventadas). Cuando el negocio los defina, por ejemplo:
//   amounts: { economico: { min: null, max: 1500 }, intermedio: { min: 1500, max: 4000 }, premium: { min: 4000, max: null } }
export type BudgetAmounts = { min: number | null; max: number | null };

export type BudgetProfile = {
  id: string;
  label: string;
  // Código ISO 4217, lo usa Intl para dar formato a los montos.
  currency: string;
  // Texto que aclara a qué se refieren los montos ("por persona", "total del viaje"). null = no se muestra.
  basis: string | null;
  amounts: Partial<Record<string, BudgetAmounts>>;
};

export const budgetProfiles: BudgetProfile[] = [
  { id: "bolivia", label: "Bolivianos (Bs)", currency: "BOB", basis: null, amounts: {} },
  { id: "internacional", label: "Dólares (US$)", currency: "USD", basis: null, amounts: {} },
];

export const budgetTiers = budgetOptions;
