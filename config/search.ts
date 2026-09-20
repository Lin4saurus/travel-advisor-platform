// Opciones editables del buscador de viajes de la Home. Los `value` son los parámetros de `/packages?...`
// (destination, type, date, duration, travelers, budget); el filtrado real se implementa en M4.
export type SelectOption = {
  value: string;
  label: string;
};

export const durationOptions: SelectOption[] = [
  { value: "1-3", label: "1 a 3 días" },
  { value: "4-7", label: "4 a 7 días" },
  { value: "8-14", label: "8 a 14 días" },
  { value: "15+", label: "15 días o más" },
];

// Rangos sin montos ni moneda a propósito: los rangos por país/moneda se configuran en M9.
export const budgetOptions: SelectOption[] = [
  { value: "economico", label: "Económico" },
  { value: "intermedio", label: "Intermedio" },
  { value: "premium", label: "Premium" },
  { value: "flexible", label: "Aún no lo sé" },
];
