"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { purchaseStatusClass } from "@/components/conductor/badges";
import { useConductor } from "@/components/conductor/conductor-context";

export default function ConductorCompraEnVivoPage() {
  const { purchaseAggregates, updatePurchaseForProduct, setProductPurchasedQtyTotal } = useConductor();
  const [q, setQ] = useState("");
  const [onlyPending, setOnlyPending] = useState(true);

  const rows = useMemo(() => {
    return purchaseAggregates.filter((r) => {
      if (onlyPending && r.qtyPending <= 0 && r.purchaseStatus === "comprado") return false;
      if (!q.trim()) return true;
      return r.productName.toLowerCase().includes(q.trim().toLowerCase());
    });
  }, [purchaseAggregates, q, onlyPending]);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/driver/compras" className="text-sm font-medium text-indigo-700">
          ← Lista clásica
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">Compra en vivo</h1>
        <p className="text-sm text-slate-600">Toques grandes · filtro rápido · ideal en almacén</p>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar producto..."
        className="w-full rounded-2xl border-2 border-indigo-200 bg-white px-4 py-4 text-base shadow-sm focus:border-indigo-500 focus:outline-none"
        autoComplete="off"
      />

      <button
        type="button"
        onClick={() => setOnlyPending((v) => !v)}
        className={`w-full rounded-xl py-3 text-sm font-semibold ${
          onlyPending ? "bg-amber-100 text-amber-950" : "bg-slate-200 text-slate-800"
        }`}
      >
        {onlyPending ? "Mostrando: pendientes / faltantes" : "Mostrando: todos"}
      </button>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.productId} className="rounded-2xl border-2 border-slate-200 bg-white p-4 active:border-indigo-400">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-bold text-slate-900">{r.productName}</p>
                <p className="text-sm text-slate-600">
                  Falta <span className="font-bold text-amber-800">{r.qtyPending}</span> de {r.qtyRequired}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${purchaseStatusClass(r.purchaseStatus)}`}>
                {r.purchaseStatus}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                className="rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white shadow"
                onClick={() => updatePurchaseForProduct(r.productId, { purchaseStatus: "comprado" })}
              >
                Listo
              </button>
              <button
                type="button"
                className="rounded-xl bg-amber-500 py-4 text-sm font-bold text-amber-950 shadow"
                onClick={() => updatePurchaseForProduct(r.productId, { purchaseStatus: "parcial" })}
              >
                Parcial
              </button>
              <button
                type="button"
                className="rounded-xl bg-rose-600 py-4 text-sm font-bold text-white shadow"
                onClick={() => updatePurchaseForProduct(r.productId, { purchaseStatus: "no_encontrado" })}
              >
                No hay
              </button>
              <button
                type="button"
                className="rounded-xl bg-violet-600 py-4 text-sm font-bold text-white shadow"
                onClick={() => updatePurchaseForProduct(r.productId, { purchaseStatus: "sustituido" })}
              >
                Sustituido
              </button>
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-800"
              onClick={() => setProductPurchasedQtyTotal(r.productId, r.qtyRequired)}
            >
              Marcar cantidad completa comprada
            </button>
            <Link href={`/driver/compras/${r.productId}`} className="mt-2 block text-center text-sm text-indigo-700">
              Detalle / costo / foto
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
