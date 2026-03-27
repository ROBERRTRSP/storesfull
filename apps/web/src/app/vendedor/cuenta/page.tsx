"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutConfirmDialog } from "@/components/vendedor/logout-confirm-dialog";
import { useSeller } from "@/components/vendedor/seller-context";

export default function VendedorCuentaPage() {
  const { profile, logout, dashboardStats, opportunities } = useSeller();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
  };

  return (
    <div className="space-y-6">
      <LogoutConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirmLogout={confirmLogout}
        dashboardStats={dashboardStats}
        opportunities={opportunities}
      />
      <div>
        <h1 className="text-xl font-bold text-slate-900">Tu cuenta</h1>
        <p className="text-sm text-slate-600">Perfil del vendedor · metricas de venta (no finanzas globales)</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500">Datos</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Nombre</dt>
            <dd className="font-medium">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Telefono</dt>
            <dd className="font-medium">{profile.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Cartera / zona</dt>
            <dd className="font-medium">{profile.zoneLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500">Tu rendimiento (resumen)</h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <li className="rounded-lg bg-slate-50 px-3 py-2">
            Ventas semana <span className="float-right font-semibold">${dashboardStats.ventasSemana.toFixed(2)}</span>
          </li>
          <li className="rounded-lg bg-slate-50 px-3 py-2">
            Pedidos confirmados hoy <span className="float-right font-semibold">{dashboardStats.pedidosConfirmadosHoy}</span>
          </li>
          <li className="rounded-lg bg-slate-50 px-3 py-2">
            Visitas con accion <span className="float-right font-semibold">{dashboardStats.visitasHechasHoy}</span>
          </li>
          <li className="rounded-lg bg-slate-50 px-3 py-2">
            Clientes sin compra reciente <span className="float-right font-semibold">{dashboardStats.clientesSinCompra}</span>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
        <h2 className="font-semibold text-amber-950">Oportunidades</h2>
        <p className="mt-1 text-xs text-amber-900/80">Antes de cerrar sesión, revisa pistas para la próxima salida.</p>
        {opportunities.length === 0 ? (
          <p className="mt-3 text-sm text-amber-950/70">No hay oportunidades abiertas por ahora.</p>
        ) : (
          <>
            <ul className="mt-3 space-y-2">
              {opportunities.slice(0, 5).map((o) => (
                <li key={o.id} className="text-sm text-amber-950/90">
                  <span className="font-medium">{o.customerName}:</span> {o.title}
                </li>
              ))}
            </ul>
            <Link href="/vendedor/oportunidades" className="mt-3 inline-block text-sm font-semibold text-amber-900 underline">
              Ver todas las oportunidades
            </Link>
          </>
        )}
      </section>

      <button
        type="button"
        onClick={() => setLogoutOpen(true)}
        className="w-full rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-900"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
