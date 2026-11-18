import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/Logo";
import { getAdminUser, safeAdminPath } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Ingresar" };

export default async function AdminLoginPage(props: PageProps<"/admin/login">) {
  const { next: nextRaw } = await props.searchParams;
  const next = safeAdminPath(Array.isArray(nextRaw) ? nextRaw[0] : nextRaw);

  // Con sesión de admin válida, no tiene sentido volver a pedir la contraseña.
  if (await getAdminUser()) redirect(next);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-travel-border bg-travel-background p-6 shadow-sm sm:p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-travel-primary-dark">Panel administrativo</h1>
        <p className="mt-1 text-sm text-travel-muted">Acceso solo para el equipo de la agencia.</p>
        <LoginForm next={next} />
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-travel-primary underline-offset-4 hover:underline">
            Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}
