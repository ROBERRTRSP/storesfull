"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { purchaseStatusClass } from "@/components/conductor/badges";
import { useConductor } from "@/components/conductor/conductor-context";
export default function ConductorComprasPage() {
  const { purchaseAggregates } = useConductor();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todos" | "pendiente" | "faltantes" | "sustituidos">("todos");

  const rows = useMemo(() => {
    return purchaseAggregates.filter((r) => {
      const matchQ =
        !q.trim() ||
        r.productName.toLowerCase().includes(q.trim().toLowerCase()) ||
        r.customerNames.some((n) => n.toLowerCase().includes(q.trim().toLowerCase()));
      if (!matchQ) return false;
      if (filter === "pendiente") return r.purchaseStatus === "pendiente" || r.qtyPending > 0;
      if (filter === "faltantes") return r.purchaseStatus === "no_encontrado" || r.qtyPending > 0;
      if (filter === "sustituidos") return r.purchaseStatus === "sustituido";
      return true;
    });
  }, [purchaseAggregates, q, filter]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Lista general de compra</h1>
        <p className="text-sm text-slate-600">Consolidado de pedidos confirmados · cantidades y costos</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar producto o cliente..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todos", "Todos"],
              ["pendiente", "Pendientes"],
              ["faltantes", "Faltantes"],
              ["sustituidos", "Sustituidos"],
            ] as const
          ).map(([k, lab]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter === k ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {lab}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.productId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{r.productName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Pedidos: {r.orderIds.join(", ")} · {r.customerNames.join(" · ")}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${purchaseStatusClass(r.purchaseStatus)}`}>
                {r.purchaseStatus}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-slate-500">Requerido</dt>
                <dd className="font-semibold">{r.qtyRequired}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Comprado</dt>
                <dd className="font-semibold">{r.qtyPurchased}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Falta</dt>
                <dd className="font-semibold text-amber-800">{r.qtyPending}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Costo real</dt>
                <dd className="font-semibold">${r.costRealTotal.toFixed(2)}</dd>
              </div>
            </dl>
            {r.supplier && <p className="mt-2 text-xs text-slate-600">Proveedor: {r.supplier}</p>}
            <Link
              href={`/conductor/compras/${r.productId}`}
              className="mt-3 inline-block text-sm font-semibold text-indigo-700"
            >
              Detalle y registro
            </Link>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="text-center text-sm text-slate-500">Sin líneas que coincidan.</p>}
    </div>
  );
}
