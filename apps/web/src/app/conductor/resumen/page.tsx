"use client";

import Link from "next/link";
import { useState } from "react";
import { useConductor } from "@/components/conductor/conductor-context";
import { paymentMethodLabel } from "@/components/conductor/badges";
import { amountPendingOrder, orderSaleTotal } from "@/components/conductor/aggregate";

export default function ConductorResumenPage() {
  const {
    today,
    orders,
    payments,
    incidents,
    dashboardStats,
    jornadaCerrada,
    closeJornada,
    jornadaHistory,
    profile,
  } = useConductor();
  const [note, setNote] = useState("");

  const totalCompraReal = orders.reduce((s, o) => s + o.lines.reduce((a, l) => a + (l.unitCostReal ?? 0) * l.qtyPurchased, 0), 0);
  const totalVenta = orders.reduce((s, o) => s + orderSaleTotal(o), 0);
  const cobradoEfectivo = payments.reduce(
    (s, p) => s + p.splits.filter((x) => x.method === "efectivo").reduce((a, x) => a + x.amount, 0),
    0,
  );
  const cobradoDigital = payments.reduce(
    (s, p) =>
      s +
      p.splits
        .filter((x) => x.method === "zelle" || x.method === "transferencia" || x.method === "cash_app" || x.method === "otro")
        .reduce((a, x) => a + x.amount, 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Resumen del día</h1>
        <p className="text-sm text-slate-600">Cierre de jornada · {today}</p>
      </div>

      <section className="grid gap-2 sm:grid-cols-2">
        {[
          ["Pedidos asignados", orders.length],
          ["Entregas completas", orders.filter((o) => o.status === "entregado").length],
          ["Entregas parciales", orders.filter((o) => o.status === "entrega_parcial").length],
          ["No entregados", orders.filter((o) => o.status === "no_entregado").length],
          ["Total venta (pedidos)", `$${totalVenta.toFixed(2)}`],
          ["Gasto compra real", `$${totalCompraReal.toFixed(2)}`],
          ["Total cobrado", `$${dashboardStats.totalCobrado.toFixed(2)}`],
          ["Efectivo", `$${cobradoEfectivo.toFixed(2)}`],
          ["Digital", `$${cobradoDigital.toFixed(2)}`],
          ["Pendiente cobro", `$${orders.reduce((s, o) => s + amountPendingOrder(o), 0).toFixed(2)}`],
          ["Incidencias", incidents.filter((i) => i.at.startsWith(today)).length],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
            <p className="text-xs text-slate-500">{k}</p>
            <p className="text-lg font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Desglose cobros</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {payments.length === 0 && <li className="text-slate-500">Sin cobros.</li>}
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
              <span className="font-mono text-xs">{p.id}</span>
              <span className="font-bold">${p.amount.toFixed(2)}</span>
              <span className="text-xs text-slate-600">
                {p.splits.map((s) => `${paymentMethodLabel(s.method)} $${s.amount.toFixed(2)}`).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
        <h2 className="font-semibold text-indigo-950">Cerrar jornada</h2>
        <p className="text-xs text-indigo-900/80">Guarda un cierre en historial (demo en memoria).</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Observaciones finales para administración..."
          className="mt-2 w-full rounded-xl border border-indigo-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={jornadaCerrada}
          onClick={() => closeJornada(note)}
          className="mt-3 w-full rounded-xl bg-indigo-700 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {jornadaCerrada ? "Jornada ya cerrada" : "Confirmar cierre del día"}
        </button>
        {jornadaCerrada && (
          <p className="mt-2 text-xs text-indigo-900">
            Último cierre registrado. Conductor: {profile.name}. Puedes seguir operando en demo o recargar para reiniciar sesión.
          </p>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">Últimos cierres</h2>
        <ul className="mt-2 space-y-2">
          {jornadaHistory.slice(0, 5).map((j) => (
            <li key={j.id} className="rounded-xl border bg-white p-3 text-sm shadow-sm">
              <p className="font-medium">
                {j.date} · {j.closedAt.slice(11, 16)}
              </p>
              <p className="text-xs text-slate-600">
                Entregados {j.stats.pedidosEntregados}/{j.stats.pedidosAsignados} · Cobrado ${j.stats.totalCobrado.toFixed(2)} · Pendiente $
                {j.stats.totalPendiente.toFixed(2)}
              </p>
              {j.note && <p className="mt-1 text-xs text-slate-500">{j.note}</p>}
            </li>
          ))}
        </ul>
      </section>

      <Link href="/conductor/dashboard" className="block text-center text-sm text-indigo-700">
        Volver al inicio
      </Link>
    </div>
  );
}
