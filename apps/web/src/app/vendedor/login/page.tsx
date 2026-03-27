"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSeller } from "@/components/vendedor/seller-context";

export default function VendedorLoginPage() {
  const router = useRouter();
  const { authenticated, loading, login } = useSeller();
  const [email, setEmail] = useState("seller@demo.local");
  const [password, setPassword] = useState("Seller1234");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/vendedor/dashboard");
    }
  }, [authenticated, loading, router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email, password);
    router.replace("/vendedor/dashboard");
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 to-slate-900 px-4 py-8 text-white">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Panel comercial</p>
          <h1 className="mt-1 text-2xl font-bold">Ruta · Vendedor</h1>
          <p className="mt-2 text-sm text-emerald-100/90">
            Visitas, pedidos y seguimiento en un solo lugar. Optimizado para movil.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <label className="block text-xs text-emerald-200">Email</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-emerald-200/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seller@demo.local"
            type="email"
            autoComplete="username"
          />
          <label className="block text-xs text-emerald-200">Contrasena</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-emerald-200/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-emerald-950 shadow-lg hover:bg-emerald-400"
          >
            Entrar
          </button>
          <p className="text-center text-xs text-emerald-200/80">Demo: seller@demo.local / Seller1234</p>
        </form>
        <Link href="/" className="text-center text-sm text-emerald-200/90 underline hover:text-white">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
