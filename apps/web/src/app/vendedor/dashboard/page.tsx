"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSeller } from "@/components/vendedor/seller-context";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm sm:px-2.5 sm:py-2.5">
      <p className="text-[10px] font-medium uppercase leading-tight tracking-wide text-slate-500 sm:text-[11px]">{label}</p>
      <p className="mt-0.5 truncate text-base font-bold leading-tight text-slate-900 sm:text-lg">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{hint}</p>}
    </div>
  );
}

function matchesVisitSearch(
  q: string,
  c: { businessName: string; contactName: string; phone: string; zone: string },
  visitStatus: string,
) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const phoneDigits = c.phone.replace(/\D/g, "");
  const qDigits = s.replace(/\D/g, "");
  return (
    c.businessName.toLowerCase().includes(s) ||
    c.contactName.toLowerCase().includes(s) ||
    c.zone.toLowerCase().includes(s) ||
    visitStatus.toLowerCase().includes(s) ||
    (qDigits.length > 0 && phoneDigits.includes(qDigits))
  );
}

export default function VendedorDashboardPage() {
  const { dashboardStats, visitsToday, customers, opportunities, offers } = useSeller();
  const [visitSearch, setVisitSearch] = useState("");

  const filteredVisits = useMemo(() => {
    return visitsToday.filter((v) => {
      const c = customers.find((x) => x.id === v.customerId);
      if (!c) return false;
      return matchesVisitSearch(visitSearch, c, v.status);
    });
  }, [visitsToday, customers, visitSearch]);

  const pendientes = useMemo(() => {
    return visitsToday.filter((v) => {
      if (v.status !== "pendiente") return false;
      const c = customers.find((x) => x.id === v.customerId);
      if (!c) return false;
      return matchesVisitSearch(visitSearch, c, v.status);
    });
  }, [visitsToday, customers, visitSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hoy</h1>
        <p className="text-sm text-slate-600">Resumen comercial y acciones rapidas</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
        <StatCard label="Por visitar" value={dashboardStats.visitasPendientesHoy} />
        <StatCard label="Visitados" value={dashboardStats.visitasHechasHoy} />
        <StatCard label="Pedidos hoy" value={dashboardStats.pedidosCreadosHoy} />
        <StatCard label="Confirmados hoy" value={dashboardStats.pedidosConfirmadosHoy} />
        <StatCard label="Ventas hoy" value={`$${dashboardStats.ventasDia.toFixed(2)}`} />
        <StatCard label="Ventas semana" value={`$${dashboardStats.ventasSemana.toFixed(2)}`} />
        <StatCard label="Sin compra reciente" value={dashboardStats.clientesSinCompra} hint="14+ dias" />
        <StatCard label="Oportunidades" value={dashboardStats.oportunidadesAbiertas} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/vendedor/clientes"
          className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700"
        >
          Buscar cliente
        </Link>
        <Link
          href="/vendedor/clientes"
          className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800"
        >
          Crear pedido
        </Link>
        <Link href="/vendedor/ruta" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Ruta del dia
        </Link>
        <Link href="/vendedor/oportunidades" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Oportunidades
        </Link>
        <Link href="/vendedor/ofertas" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Ofertas activas
        </Link>
        <Link href="/vendedor/seguimiento" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Seguimiento ({dashboardStats.seguimientosPendientes})
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Visitas del dia</h2>
          <Link href="/vendedor/ruta" className="text-sm font-medium text-emerald-700">
            Ver ruta
          </Link>
        </div>
        <input
          type="search"
          value={visitSearch}
          onChange={(e) => setVisitSearch(e.target.value)}
          placeholder="Buscar cliente (negocio, contacto, telefono, zona, estado)..."
          className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          autoComplete="off"
        />
        <ul className="mt-3 divide-y divide-slate-100">
          {filteredVisits.map((v) => {
            const c = customers.find((x) => x.id === v.customerId);
            if (!c) return null;
            return (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                <div>
                  <p className="font-medium text-slate-900">{c.businessName}</p>
                  <p className="text-xs text-slate-500">
                    {c.zone} · {v.status}
                  </p>
                </div>
                <Link
                  href={`/vendedor/clientes/${c.id}`}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Abrir
                </Link>
              </li>
            );
          })}
        </ul>
        {filteredVisits.length === 0 && (
          <p className="mt-3 text-center text-sm text-slate-500">Ningun cliente coincide con la busqueda.</p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Clientes pendientes</h2>
          <ul className="mt-2 space-y-2">
            {pendientes.slice(0, 6).map((v) => {
              const c = customers.find((x) => x.id === v.customerId);
              if (!c) return null;
              return (
                <li key={v.id} className="flex justify-between gap-2 text-sm">
                  <span className="text-slate-800">{c.businessName}</span>
                  <Link href={`/vendedor/clientes/${c.id}`} className="text-emerald-700">
                    Ir
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Ofertas activas</h2>
          <ul className="mt-2 space-y-2">
            {offers.slice(0, 3).map((o) => (
              <li key={o.id} className="text-sm">
                <span className="font-medium text-slate-800">{o.title}</span>
                <span className="text-slate-500"> · hasta {o.validUntil}</span>
              </li>
            ))}
          </ul>
          <Link href="/vendedor/ofertas" className="mt-3 inline-block text-sm font-medium text-emerald-700">
            Ver todas
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
        <h2 className="font-semibold text-amber-950">Oportunidades destacadas</h2>
        <ul className="mt-2 space-y-2">
          {opportunities.slice(0, 3).map((o) => (
            <li key={o.id} className="text-sm text-amber-950/90">
              <span className="font-medium">{o.customerName}:</span> {o.title}
            </li>
          ))}
        </ul>
        <Link href="/vendedor/oportunidades" className="mt-3 inline-block text-sm font-semibold text-amber-900 underline">
          Ver oportunidades
        </Link>
      </section>
    </div>
  );
}
