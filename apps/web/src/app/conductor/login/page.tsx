"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConductor } from "@/components/conductor/conductor-context";

export default function ConductorLoginPage() {
  const router = useRouter();
  const { authenticated, loading, login } = useConductor();
  const [email, setEmail] = useState("driver@demo.local");
  const [password, setPassword] = useState("Driver1234");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/conductor/dashboard");
    }
  }, [authenticated, loading, router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email, password);
    router.replace("/conductor/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Cargando...
      </div>
    );
  }

  if (authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-900 px-4 py-8 text-white">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Operaciones en ruta</p>
          <h1 className="mt-1 text-2xl font-bold">Conductor / Comprador</h1>
          <p className="mt-2 text-sm text-indigo-100/90">
            Compra consolidada, entregas y cobros en un solo flujo. Pensado para móvil y trabajo en la calle.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <label className="block text-xs text-indigo-200">Email</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-indigo-200/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="driver@demo.local"
            type="email"
            autoComplete="username"
          />
          <label className="block text-xs text-indigo-200">Contraseña</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-indigo-200/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-400"
          >
            Entrar
          </button>
          <p className="text-center text-xs text-indigo-200/80">Demo: driver@demo.local / Driver1234</p>
        </form>
        <Link href="/" className="text-center text-sm text-indigo-200/90 underline hover:text-white">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
