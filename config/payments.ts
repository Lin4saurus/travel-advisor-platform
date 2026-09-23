// Formas de pago (M11, `/booking-info`). Editable y sin logos de bancos hasta tener autorización: cada método es
// solo texto. Vacío = todavía no hay formas de pago confirmadas; la página lo dice en vez de inventar una lista.
// Ejemplo de cómo cargarlas cuando el negocio las confirme:
//   { label: "Transferencia bancaria", description: "Datos de la cuenta se envían junto con tu cotización." },
//   { label: "Tarjeta de crédito o débito", description: null },
export type PaymentMethod = {
  label: string;
  description: string | null;
};

export const paymentMethods: PaymentMethod[] = [];
