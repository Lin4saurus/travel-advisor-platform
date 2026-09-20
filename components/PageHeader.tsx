import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  // Contenido adicional bajo la descripción (p. ej. un botón de acción).
  children?: ReactNode;
};

// Encabezado de las páginas de listado (destinos, paquetes, experiencias, eventos).
export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="border-b border-travel-border bg-travel-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-travel-primary-dark sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-lg text-travel-muted">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
