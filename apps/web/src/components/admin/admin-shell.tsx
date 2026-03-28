"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAdmin } from "./admin-context";

const mobileNav = [
  { href: "/admin", label: "Inicio", icon: "⌂" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "▤" },
  { href: "/admin/clientes", label: "Clientes", icon: "◎" },
  { href: "/admin/alertas", label: "Alertas", icon: "!" },
  { href: "/admin/menu", label: "Más", icon: "≡" },
];

const sideNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/compras", label: "Compras" },
  { href: "/admin/entregas", label: "Entregas / rutas" },
  { href: "/admin/pagos", label: "Pagos / cobros" },
  { href: "/admin/balances", label: "Cuentas por cobrar" },
  { href: "/admin/gastos", label: "Gastos" },
  { href: "/admin/contabilidad", label: "Contabilidad" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/configuracion", label: "Configuración" },
  { href: "/admin/auditoria", label: "Auditoría" },
  { href: "/admin/alertas", label: "Alertas" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, loading, logout } = useAdmin();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/");
    }
  }, [loading, authenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Cargando panel administrador...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Redirigiendo al inicio de sesión...
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin" || pathname === "/admin/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="font-semibold text-slate-900">
            <span className="text-indigo-600">Ruta</span> · Administración
          </Link>
          <div className="hidden min-w-0 flex-1 px-4 md:block">
            <input
              type="search"
              placeholder="Búsqueda global (demo: filtra en cada módulo)..."
              className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400"
              readOnly
              title="En producción: buscador unificado"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/admin/alertas"
              className="hidden rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 md:inline-block"
            >
              Alertas
            </Link>
            <button type="button" onClick={logout} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-900 p-3 md:block">
          <nav className="space-y-0.5">
            {sideNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  isActive(item.href) ? "bg-indigo-600 font-medium text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-h-[calc(100vh-57px)] flex-1 px-4 py-4 pb-24 md:pb-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {mobileNav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin" || pathname === "/admin/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center py-2 text-[10px] ${active ? "font-semibold text-indigo-700" : "text-slate-500"}`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="mt-0.5">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
