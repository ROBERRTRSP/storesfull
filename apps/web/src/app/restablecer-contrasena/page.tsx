"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";
import { AuthBrandShell } from "@/components/auth/auth-brand-shell";

function passwordErrors(p: string): string | null {
  if (p.length < 8) return "Mínimo 8 caracteres.";
  if (!/[A-Za-z]/.test(p)) return "Incluye al menos una letra.";
  if (!/[0-9]/.test(p)) return "Incluye al menos un número.";
  return null;
}

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const token = tokenFromUrl.trim();
    if (!token) {
      setError("Enlace inválido. Solicita uno nuevo desde “Recuperar contraseña”.");
      return;
    }
    const pe = passwordErrors(password);
    if (pe) {
      setError(pe);
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "No se pudo actualizar la contraseña.");
        return;
      }
      router.replace("/?reset=ok");
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-md"
    >
      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2.5 text-sm text-red-100">{error}</p>
      ) : null}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300" htmlFor="np1">
          Nueva contraseña
        </label>
        <input
          id="np1"
          className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300" htmlFor="np2">
          Confirmar
        </label>
        <input
          id="np2"
          className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type="password"
          autoComplete="new-password"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-400 disabled:opacity-50"
      >
        {submitting ? "Guardando…" : "Guardar contraseña"}
      </button>
      <div className="border-t border-white/10 pt-4 text-center text-sm">
        <Link href="/recuperar-contrasena" className="font-medium text-indigo-300 hover:text-white hover:underline">
          Solicitar otro enlace
        </Link>
        <span className="mx-2 text-slate-500">·</span>
        <Link href="/" className="font-medium text-slate-400 hover:text-white hover:underline">
          Inicio de sesión
        </Link>
      </div>
    </form>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <AuthBrandShell
      headline="Nueva contraseña"
      description="Mínimo 8 caracteres, al menos una letra y un número."
    >
      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-8 text-center text-sm text-slate-400 backdrop-blur-md">
            Cargando…
          </div>
        }
      >
        <RestablecerForm />
      </Suspense>
    </AuthBrandShell>
  );
}
