"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { LogoutConfirmDialog } from "./logout-confirm-dialog";
import { useSeller } from "./seller-context";

const mobileNav: { href: string; label: string; icon: string; title?: string }[] = [
  { href: "/vendedor", label: "Inicio", icon: "⌂" },
  { href: "/vendedor/clientes", label: "Clientes", icon: "◎" },
  { href: "/vendedor/ruta", label: "Ruta", icon: "→" },
  { href: "/vendedor/oportunidades", label: "Oportun.", icon: "★", title: "Oportunidades" },
  { href: "/vendedor/seguimiento", label: "Seguimiento", icon: "✎" },
  { href: "/vendedor/cuenta", label: "Cuenta", icon: "☺" },
];

const sideNav = [
  { href: "/vendedor", label: "Dashboard" },
  { href: "/vendedor/clientes", label: "Clientes" },
  { href: "/vendedor/ruta", label: "Ruta del día" },
  { href: "/vendedor/oportunidades", label: "Oportunidades" },
  { href: "/vendedor/ofertas", label: "Ofertas" },
  { href: "/vendedor/seguimiento", label: "Seguimiento" },
  { href: "/vendedor/visitas", label: "Historial visitas" },
  { href: "/vendedor/cuenta", label: "Perfil" },
];

export function VendedorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, loading, logout, dashboardStats, opportunities } = useSeller();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
  };

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/");
    }
  }, [loading, authenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Cargando panel...
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
    if (href === "/vendedor") return pathname === "/vendedor" || pathname === "/vendedor/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <LogoutConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirmLogout={confirmLogout}
        dashboardStats={dashboardStats}
        opportunities={opportunities}
      />
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/vendedor" className="font-semibold text-emerald-800">
            Ruta · Vendedor
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/vendedor/clientes"
              className="hidden rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 md:inline-flex"
            >
              + Pedido rápido
            </Link>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="rounded-lg border px-3 py-1.5 text-sm text-slate-600"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-52 shrink-0 border-r border-slate-200 bg-white p-3 md:block">
          <nav className="space-y-1">
            {sideNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${isActive(item.href) ? "bg-emerald-50 font-medium text-emerald-900" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-h-[calc(100vh-57px)] flex-1 px-4 py-4 pb-24 md:pb-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-6">
          {mobileNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.title}
                className={`flex flex-col items-center py-2 text-[9px] leading-tight ${
                  (item.href === "/vendedor"
                    ? pathname === "/vendedor" || pathname === "/vendedor/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`))
                    ? "font-semibold text-emerald-800"
                    : "text-slate-500"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="mt-0.5 text-center">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
