// Estilos de botón compartidos (se aplican a <Link> o <button>).
// Contraste: texto oscuro sobre `accent` (el blanco no llega a 4.5:1, ver globals.css).
const base =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition";

export const buttonStyles = {
  primary: `${base} bg-travel-accent text-travel-text hover:brightness-95`,
  secondary: `${base} bg-travel-primary text-white hover:bg-travel-primary-dark`,
  outline: `${base} border border-travel-primary text-travel-primary hover:bg-travel-surface`,
  onDark: `${base} border border-white/70 text-white hover:bg-white/10`,
};
