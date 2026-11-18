import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import AdminNav from "@/components/admin/AdminNav";
import Logo from "@/components/Logo";
import { requireAdmin } from "@/lib/admin/auth";

// Marco de todas las páginas del panel salvo el login (el grupo `(panel)` no aparece en la URL).
// `requireAdmin` aquí es solo para el encabezado: cada página y cada Server Action vuelve a comprobarlo, porque
// un layout no se vuelve a ejecutar en cada navegación y no protege a las Server Actions.
export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();

  return (
    <>
      <header className="border-b border-travel-border bg-travel-background">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/admin" aria-label="Panel de Mundo Viajero: resumen" className="shrink-0">
            <Logo />
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-travel-muted sm:inline" title="Sesión iniciada">
              {user.email}
            </span>
            <Link href="/" className="text-travel-primary underline-offset-4 hover:underline">
              Ver sitio
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-9 items-center rounded-full border border-travel-border px-4 font-medium text-travel-text hover:bg-travel-surface"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
