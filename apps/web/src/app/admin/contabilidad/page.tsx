"use client";

import { useAdmin } from "@/components/admin/admin-context";

export default function AdminContabilidadPage() {
  const { kpis, orders } = useAdmin();
  const ventas = orders.reduce((s, o) => s + o.total, 0);
  const grossPerOrder = orders.length ? kpis.gananciaBruta / orders.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Contabilidad resumida</h1>
        <p className="text-sm text-slate-600">Operativa: ventas, compras, cobros, gastos y márgenes</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total vendido (pedidos muestra)", value: `$${ventas.toFixed(2)}` },
          { label: "Total comprado (KPI demo)", value: `$${kpis.comprasSemana.toFixed(2)}` },
          { label: "Total cobrado (KPI demo)", value: `$${kpis.cobradoHoy.toFixed(2)}` },
          { label: "Pendiente cobrar", value: `$${kpis.pendienteCobrar.toFixed(2)}` },
          { label: "Gastos período", value: `$${kpis.gastosPeriodo.toFixed(2)}` },
          { label: "Ganancia bruta", value: `$${kpis.gananciaBruta.toFixed(2)}`, hint: "Ventas − compras" },
          { label: "Ganancia neta", value: `$${kpis.gananciaNeta.toFixed(2)}`, hint: "Ventas − compras − gastos" },
          { label: "Ganancia / pedido (aprox.)", value: `$${grossPerOrder.toFixed(2)}` },
        ].map((x) => (
          <div key={x.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">{x.label}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{x.value}</p>
            {"hint" in x && x.hint && <p className="mt-1 text-xs text-slate-500">{x.hint}</p>}
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="font-semibold text-slate-900">Desglose por dimensión</h2>
        <p className="mt-2 text-sm text-slate-600">
          En producción: ganancia por cliente, producto, vendedor y período con consultas al backend. Fórmulas base: ganancia bruta = ventas − compras; ganancia neta = ventas − compras − gastos.
        </p>
      </section>
    </div>
  );
}
