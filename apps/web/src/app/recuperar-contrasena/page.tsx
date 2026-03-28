"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api";
import { AuthBrandShell } from "@/components/auth/auth-brand-shell";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const t = email.trim();
    if (!t) {
      setError("Introduce tu email.");
      return;
    }
    if (!emailOk(t)) {
      setError("Introduce un email válido.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: t }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "No se pudo procesar la solicitud.");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthBrandShell
      headline="Recuperar contraseña"
      description="Te enviaremos un enlace para elegir una nueva contraseña (válido 1 hora). Sin SMTP, en desarrollo el enlace aparece en la consola del servidor."
    >
      {done ? (
        <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 text-sm text-slate-200 shadow-xl backdrop-blur-md">
          <p>Si el email está registrado, recibirás instrucciones en breve. Revisa también la carpeta de spam.</p>
          <Link
            href="/"
            className="mt-5 block text-center text-sm font-medium text-indigo-300 underline-offset-2 hover:text-white hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-md"
        >
          {error ? (
            <p className="rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2.5 text-sm text-red-100">{error}</p>
          ) : null}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="rec-email">
              Email
            </label>
            <input
              id="rec-email"
              className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-400 disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
    </AuthBrandShell>
  );
}
