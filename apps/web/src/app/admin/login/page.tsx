"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { authenticated, loading, login } = useAdmin();
  const [email, setEmail] = useState("admin@demo.local");
  const [password, setPassword] = useState("Admin1234");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/admin/dashboard");
    }
  }, [authenticated, loading, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const err = await login(email, password);
    if (err) {
      setError(err);
      return;
    }
    router.replace("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Cargando...
      </div>
    );
  }

  if (authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10 text-white">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Centro de control</p>
          <h1 className="mt-1 text-2xl font-bold">Ruta · Administrador</h1>
          <p className="mt-2 text-sm text-slate-300">
            Operación completa: ventas, compras, entregas, cobros, balances y reportes.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          {error && <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">{error}</p>}
          <label className="block text-xs text-slate-300">Email</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@demo.local"
            type="email"
            autoComplete="username"
          />
          <label className="block text-xs text-slate-300">Contraseña</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-500"
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
          <p className="text-center text-xs text-slate-400">
            Cuenta API (tras seed): admin@demo.local / Admin1234
          </p>
        </form>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link href="/" className="text-slate-300 underline hover:text-white">
            Volver al inicio
          </Link>
          <Link href="/vendedor/login" className="text-slate-300 underline hover:text-white">
            Panel vendedor
          </Link>
        </div>
      </div>
    </div>
  );
}
