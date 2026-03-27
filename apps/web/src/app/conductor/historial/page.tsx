"use client";

import { useState } from "react";
import { useConductor } from "@/components/conductor/conductor-context";
import { deliveryStatusClass, paymentMethodLabel, purchaseStatusClass } from "@/components/conductor/badges";

type Tab = "cierres" | "cobros" | "compras" | "entregas" | "incidencias";

export default function ConductorHistorialPage() {
  const { jornadaHistory, payments, orders, incidents, customers } = useConductor();
  const [tab, setTab] = useState<Tab>("cierres");

  const tabs: { id: Tab; label: string }[] = [
    { id: "cierres", label: "Cierres" },
    { id: "cobros", label: "Cobros" },
    { id: "compras", label: "Compras" },
    { id: "entregas", label: "Entregas" },
    { id: "incidencias", label: "Incidencias" },
  ];

  const cName = (id: string) => customers.find((c) => c.id === id)?.businessName ?? id;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Historial</h1>
        <p className="text-sm text-slate-600">Cierres, cobros, líneas de compra y entrega</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === t.id ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cierres" && (
        <ul className="space-y-2">
          {jornadaHistory.map((j) => (
            <li key={j.id} className="rounded-xl border bg-white p-3 text-sm">
              <p className="font-semibold">{j.date}</p>
              <p className="text-xs text-slate-600">
                Pedidos {j.stats.pedidosAsignados} · Cobrado ${j.stats.totalCobrado.toFixed(2)} · Compra ${j.stats.totalCompraReal.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {tab === "cobros" && (
        <ul className="space-y-2">
          {payments.map((p) => (
            <li key={p.id} className="rounded-xl border bg-white p-3 text-xs">
              <p className="font-bold">${p.amount.toFixed(2)}</p>
              <p>{cName(p.customerId)}</p>
              <p className="text-slate-500">{p.splits.map((s) => paymentMethodLabel(s.method)).join(", ")}</p>
            </li>
          ))}
        </ul>
      )}

      {tab === "compras" && (
        <ul className="space-y-2">
          {orders.flatMap((o) =>
            o.lines.map((l) => (
              <li key={`${o.id}-${l.productId}`} className="rounded-xl border bg-white p-3 text-xs">
                <p className="font-medium">{l.productName}</p>
                <p>
                  Pedido {o.id} · {cName(o.customerId)}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 ${purchaseStatusClass(l.purchaseStatus)}`}>
                  {l.purchaseStatus}
                </span>
              </li>
            )),
          )}
        </ul>
      )}

      {tab === "entregas" && (
        <ul className="space-y-2">
          {orders.flatMap((o) =>
            o.lines.map((l) => (
              <li key={`${o.id}-d-${l.productId}`} className="rounded-xl border bg-white p-3 text-xs">
                <p className="font-medium">{l.productName}</p>
                <p>
                  {cName(o.customerId)} · entregado {l.qtyDelivered}/{l.qtyOrdered}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 ${deliveryStatusClass(l.deliveryStatus)}`}>
                  {l.deliveryStatus}
                </span>
              </li>
            )),
          )}
        </ul>
      )}

      {tab === "incidencias" && (
        <ul className="space-y-2">
          {incidents.map((i) => (
            <li key={i.id} className="rounded-xl border bg-white p-3 text-xs">
              <p className="font-semibold">{i.type}</p>
              <p>{i.description}</p>
              <p className="text-slate-400">{i.at}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
