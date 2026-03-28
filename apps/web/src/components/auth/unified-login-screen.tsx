"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiLogin, networkErrorMessage } from "@/lib/api";
import { dashboardPathForRole, storageKeyForRole } from "@/lib/login-redirect";
import { AuthBrandShell } from "./auth-brand-shell";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function UnifiedLoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetOk = searchParams.get("reset") === "ok";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Introduce email y contraseña.");
      return;
    }
    if (!emailOk(trimmed)) {
      setError("Introduce un email válido.");
      return;
    }
    setSubmitting(true);
    try {
      const { accessToken, user } = await apiLogin(trimmed, password);
      const path = dashboardPathForRole(user.role);
      if (!path) {
        setError("Rol de usuario no reconocido.");
        return;
      }
      window.localStorage.setItem(storageKeyForRole(user.role), accessToken);
      router.replace(path);
    } catch (err) {
      setError(networkErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthBrandShell
      headline="Acceso unificado"
      description="Inicia sesión con tu email corporativo. Según tu rol irás al panel de administración, vendedor, conductor o cliente."
    >
      {resetOk ? (
        <div
          role="status"
          className="mb-4 rounded-xl border border-emerald-500/50 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-100"
        >
          Contraseña actualizada. Ya puedes iniciar sesión.
        </div>
      ) : null}

      <div className="mb-5 rounded-xl border border-indigo-500/25 bg-indigo-950/40 px-4 py-3 text-xs leading-relaxed text-indigo-100/90">
        <p className="font-medium text-indigo-200">Cuentas de demostración</p>
        <p className="mt-1 text-indigo-100/80">
          Admin: <code className="rounded bg-black/30 px-1.5 py-0.5 text-[11px]">admin@demo.local</code> · Vendedor:{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-[11px]">seller@demo.local</code> · Contraseñas en el README
          del proyecto (p. ej. Admin1234).
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl shadow-black/40 backdrop-blur-md"
      >
        {error ? (
          <p className="rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2.5 text-sm text-red-100">{error}</p>
        ) : null}

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300" htmlFor="unified-email">
            Email
          </label>
          <input
            id="unified-email"
            className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none ring-indigo-400/0 transition placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            type="email"
            autoComplete="username"
            inputMode="email"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300" htmlFor="unified-password">
            Contraseña
          </label>
          <input
            id="unified-password"
            className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none ring-indigo-400/0 transition placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {submitting ? "Entrando…" : "Entrar al panel"}
        </button>

        <div className="border-t border-white/10 pt-4 text-center">
          <Link
            href="/recuperar-contrasena"
            className="text-sm font-medium text-indigo-300 underline-offset-2 hover:text-white hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </AuthBrandShell>
  );
}
