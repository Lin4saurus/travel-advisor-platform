// Formas de pago (M11, `/booking-info`). Editable y sin logos de bancos hasta tener autorización: cada método es
// solo texto. Vacío = todavía no hay formas de pago confirmadas; la página lo dice en vez de inventar una lista.
// Ejemplo de cómo cargarlas cuando el negocio las confirme:
//   { label: "Transferencia bancaria", description: "Datos de la cuenta se envían junto con tu cotización." },
//   { label: "Tarjeta de crédito o débito", description: null },
export type PaymentMethod = {
  label: string;
  description: string | null;
};

// Las dos que publica universaltours.com.bo (revisado el 2026-11-20): el portal de "Pagos QR" y el pago en cuotas.
// No se detallan bancos, montos ni plazos porque el sitio no los publica: se confirman con la cotización.
export const paymentMethods: PaymentMethod[] = [
  {
    label: "Pago con código QR",
    description: "Paga desde la app de tu banco escaneando el código QR que te enviamos con tu reserva.",
  },
  {
    label: "Pago en cuotas",
    description: "Universal Tours ofrece financiar tu viaje en cuotas sin intereses; consulta las condiciones con tu asesor.",
  },
];
