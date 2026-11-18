"use client";

// Error en el propio layout raíz (M13): reemplaza todo el documento, por eso trae su `<html>`/`<body>` y estilos en
// línea (globals.css podría no haber cargado). Mensaje propio, sin detalle técnico.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#172b4d", background: "#ffffff" }}>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 16px" }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>No pudimos mostrar esta página</h1>
          <p role="alert" style={{ color: "#647084" }}>
            Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
          </p>
          {error.digest && <p style={{ fontSize: 12, color: "#647084" }}>Código del error: {error.digest}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{ minHeight: 40, padding: "0 20px", borderRadius: 999, border: 0, background: "#0f4c81", color: "#fff", fontWeight: 600 }}
            >
              Intentar de nuevo
            </button>
            {/* `<a>` y no `<Link>`: el layout raíz falló, conviene una carga completa. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ minHeight: 40, display: "inline-flex", alignItems: "center", color: "#0f4c81" }}>
              Ir al inicio
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
