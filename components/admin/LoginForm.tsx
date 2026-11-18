"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { buttonStyles } from "@/components/ui/buttons";
import { fieldClass, labelClass } from "@/components/ui/fields";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {
    error: null,
    email: "",
  });

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="admin-email" className={labelClass}>
          Correo
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "admin-login-error" : undefined}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className={labelClass}>
          Contraseña
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "admin-login-error" : undefined}
          className={fieldClass}
        />
      </div>
      <p id="admin-login-error" role="alert" aria-live="assertive" className="min-h-5 text-sm text-travel-danger">
        {state.error}
      </p>
      <button type="submit" disabled={pending} className={`${buttonStyles.secondary} w-full disabled:opacity-60`}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
