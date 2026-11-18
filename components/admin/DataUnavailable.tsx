// Aviso cuando Supabase no responde. El detalle técnico queda solo en el log del servidor.
export default function DataUnavailable({ what }: { what: string }) {
  return (
    <div role="alert" className="rounded-xl border border-travel-danger/40 bg-red-50 p-4 text-sm text-red-900">
      No pudimos cargar {what}. Revisa la conexión con la base de datos (Supabase) e inténtalo de nuevo; el detalle
      técnico quedó en el registro del servidor.
    </div>
  );
}
