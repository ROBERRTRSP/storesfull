"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { useClientData } from "./client-context";
import { FloatingCart } from "./floating-cart";

const items = [
  { href: "/cliente", label: "Inicio" },
  { href: "/cliente/catalogo", label: "Catalogo" },
  { href: "/cliente/carrito", label: "Carrito" },
  { href: "/cliente/pedidos", label: "Pedidos" },
  { href: "/cliente/perfil", label: "Perfil" },
];

export function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { authenticated, loading, authError, login, logout } = useClientData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    void login(email, password);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold">Portal cliente</h1>
          <p className="mt-1 text-sm text-slate-500">Inicia sesion para ver catalogo, pedidos y balance.</p>
          <form className="mt-4 space-y-2" onSubmit={onLogin}>
            <input className="w-full rounded-lg border px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className="w-full rounded-lg border px-3 py-2 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          {authError && <p className="mt-2 text-xs text-rose-600">{authError}</p>}
          <p className="mt-3 text-center text-xs text-slate-500">
            <Link href="/" className="underline hover:text-slate-700">
              Acceso unificado para todos los roles
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="font-semibold">Panel Cliente</p>
          <div className="flex items-center gap-2">
            <Link href="/cliente/ayuda" className="rounded-lg border px-3 py-1 text-sm">
              Ayuda
            </Link>
            <button onClick={logout} className="rounded-lg border px-3 py-1 text-sm">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>
      <FloatingCart />
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white md:hidden">
        <ul className="grid grid-cols-5">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`block px-2 py-3 text-center text-xs ${active ? "font-semibold text-slate-900" : "text-slate-500"}`}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

