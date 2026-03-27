"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useConductor } from "./conductor-context";

const mobileNav: { href: string; label: string; icon: string }[] = [
  { href: "/conductor/dashboard", label: "Inicio", icon: "⌂" },
  { href: "/conductor/compras", label: "Compras", icon: "☰" },
  { href: "/conductor/ruta", label: "Ruta", icon: "→" },
  { href: "/conductor/cobros", label: "Cobros", icon: "$" },
  { href: "/conductor/resumen", label: "Resumen", icon: "✓" },
];

const sideNav: { href: string; label: string }[] = [
  { href: "/conductor/dashboard", label: "Dashboard" },
  { href: "/conductor/compras", label: "Lista de compra" },
  { href: "/conductor/compras/vinculados", label: "Pedidos vinculados" },
  { href: "/conductor/compras/en-vivo", label: "Compra en vivo" },
  { href: "/conductor/ruta", label: "Ruta del día" },
  { href: "/conductor/cobros", label: "Cobros" },
  { href: "/conductor/cobros/historial", label: "Historial cobros" },
  { href: "/conductor/recibos", label: "Recibos" },
  { href: "/conductor/incidencias", label: "Incidencias" },
  { href: "/conductor/resumen", label: "Cierre de jornada" },
  { href: "/conductor/historial", label: "Historial" },
  { href: "/conductor/perfil", label: "Perfil" },
];

export function ConductorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, loading, logout } = useConductor();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/conductor/login");
    }
  }, [loading, authenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Cargando operaciones...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Redirigiendo...
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/conductor/dashboard") return pathname === href;
    if (href === "/conductor/compras") {
      return (
        pathname === href ||
        (pathname.startsWith("/conductor/compras/") &&
          !pathname.includes("/vinculados") &&
          !pathname.includes("/en-vivo"))
      );
    }
    if (href === "/conductor/cobros") {
      return pathname === href || pathname.startsWith("/conductor/cobros/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <Link href="/conductor/dashboard" className="min-w-0 shrink font-semibold text-indigo-900">
            <span className="block truncate text-sm sm:text-base">Ruta · Conductor</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/conductor/compras/en-vivo"
              className="hidden rounded-full bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 sm:inline-flex sm:text-sm"
            >
              Compra rápida
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 sm:px-3 sm:text-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-56 shrink-0 border-r border-slate-200 bg-white p-3 md:block">
          <nav className="space-y-0.5">
            {sideNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${isActive(item.href) ? "bg-indigo-50 font-medium text-indigo-950" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-h-[calc(100vh-57px)] flex-1 px-3 py-4 pb-24 md:px-4 md:pb-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {mobileNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center py-2 text-[10px] ${
                  (item.href === "/conductor/dashboard"
                    ? pathname === "/conductor/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`))
                    ? "font-semibold text-indigo-800"
                    : "text-slate-500"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="mt-0.5">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
