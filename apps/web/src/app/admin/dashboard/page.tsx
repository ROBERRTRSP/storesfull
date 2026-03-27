"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdmin } from "@/components/admin/admin-context";

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm sm:px-2.5 sm:py-2.5">
      <p className="text-[10px] font-medium uppercase leading-tight tracking-wide text-slate-500 sm:text-[11px]">{label}</p>
      <p className="mt-0.5 truncate text-base font-bold leading-tight text-slate-900 sm:text-lg">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{hint}</p>}
    </div>
  );
}

function MiniBars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-28 items-end gap-1">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-indigo-500/80"
            style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 4 : 0 }}
            title={`${labels[i]}: ${v}`}
          />
          <span className="truncate text-[9px] text-slate-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { kpis, orders, alerts, customers, products } = useAdmin();

  const pendingAlerts = useMemo(() => alerts.filter((a) => a.state === "pendiente"), [alerts]);

  const salesByDay = [120, 95, 140, 88, 210, 128, kpis.ventasHoy];
  const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  const bySeller = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach((o) => {
      m.set(o.sellerName, (m.get(o.sellerName) ?? 0) + o.total);
    });
    return Array.from(m.entries());
  }, [orders]);

  const topProducts = products.slice(0, 3).map((p) => p.name);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Visión operativa y acciones rápidas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/pedidos" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700">
            Ver pedidos
          </Link>
          <Link href="/admin/reportes" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium">
            Reportes
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">KPIs principales</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          <KpiCard label="Ventas hoy" value={`$${kpis.ventasHoy.toFixed(2)}`} />
          <KpiCard label="Ventas semana" value={`$${kpis.ventasSemana.toFixed(2)}`} />
          <KpiCard label="Ventas mes" value={`$${kpis.ventasMes.toLocaleString()}`} />
          <KpiCard label="Compras hoy" value={`$${kpis.comprasHoy.toFixed(2)}`} />
          <KpiCard label="Compras semana" value={`$${kpis.comprasSemana.toFixed(2)}`} />
          <KpiCard label="Cobrado hoy" value={`$${kpis.cobradoHoy.toFixed(2)}`} />
          <KpiCard label="Pendiente cobrar" value={`$${kpis.pendienteCobrar.toFixed(2)}`} />
          <KpiCard label="Ganancia bruta" value={`$${kpis.gananciaBruta.toFixed(2)}`} />
          <KpiCard label="Ganancia neta" value={`$${kpis.gananciaNeta.toFixed(2)}`} />
          <KpiCard label="Gastos período" value={`$${kpis.gastosPeriodo.toFixed(2)}`} />
          <KpiCard label="Pedidos pendientes" value={kpis.pedidosPendientes} />
          <KpiCard label="En compra" value={kpis.pedidosEnCompra} />
          <KpiCard label="En ruta" value={kpis.pedidosEnRuta} />
          <KpiCard label="Entregados" value={kpis.pedidosEntregados} />
          <KpiCard label="Cancelados" value={kpis.pedidosCancelados} />
          <KpiCard label="Clientes activos" value={kpis.clientesActivos} />
          <KpiCard label="Clientes con deuda" value={kpis.clientesConDeuda} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Ventas por día (demo)</h2>
            <span className="text-xs text-slate-500">vs. semana anterior</span>
          </div>
          <MiniBars values={salesByDay} labels={dayLabels} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-900">Ventas por vendedor</h2>
          <ul className="space-y-2">
            {bySeller.map(([name, total]) => (
              <li key={name} className="flex justify-between text-sm">
                <span className="text-slate-700">{name}</span>
                <span className="font-medium text-slate-900">${total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/reportes" className="mt-3 inline-block text-sm font-medium text-indigo-700">
            Ver reportes detallados
          </Link>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Productos más vendidos (referencia)</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            {topProducts.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ol>
        </section>
        <section className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-amber-950">Alertas pendientes</h2>
            <Link href="/admin/alertas" className="text-sm font-medium text-amber-900 underline">
              Gestionar
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {pendingAlerts.length === 0 && <li className="text-sm text-amber-900/80">Sin alertas pendientes.</li>}
            {pendingAlerts.map((a) => (
              <li key={a.id} className="rounded-lg border border-amber-200/80 bg-white/80 px-3 py-2 text-sm text-amber-950">
                <span className="font-medium">{a.title}</span>
                <p className="text-xs text-amber-900/80">{a.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Clientes con saldo (muestra)</h2>
        <ul className="mt-2 divide-y divide-slate-100">
          {customers
            .filter((c) => c.balancePending > 0)
            .map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <p className="font-medium text-slate-900">{c.businessName}</p>
                  <p className="text-xs text-slate-500">
                    {c.sellerName} · {c.zone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-700">${c.balancePending.toFixed(2)}</p>
                  <Link href={`/admin/clientes/${c.id}`} className="text-xs font-medium text-indigo-700">
                    Ver ficha
                  </Link>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
