"use client";

import Link from "next/link";
import { useConductor } from "@/components/conductor/conductor-context";
import { purchaseStatusClass } from "@/components/conductor/badges";

export default function ConductorComprasVinculadosPage() {
  const { purchaseAggregates, orders, customers } = useConductor();
  const name = (id: string) => customers.find((c) => c.id === id)?.businessName ?? id;

  return (
    <div className="space-y-4">
      <div>
        <Link href="/driver/compras" className="text-sm font-medium text-indigo-700">
          ← Lista de compra
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">Pedidos vinculados a la compra</h1>
        <p className="text-sm text-slate-600">Trazabilidad producto → pedidos → clientes</p>
      </div>

      <ul className="space-y-4">
        {purchaseAggregates.map((r) => (
          <li key={r.productId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-slate-900">{r.productName}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${purchaseStatusClass(r.purchaseStatus)}`}>
                {r.purchaseStatus}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Requerido {r.qtyRequired} · comprado {r.qtyPurchased} · falta {r.qtyPending}
            </p>
            <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {r.orderIds.map((oid) => {
                const o = orders.find((x) => x.id === oid);
                if (!o) return null;
                const line = o.lines.find((l) => l.productId === r.productId);
                if (!line) return null;
                return (
                  <li key={oid} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <p className="font-medium text-slate-800">
                      Pedido <span className="font-mono text-xs">{oid}</span> · {name(o.customerId)}
                    </p>
                    <p className="text-xs text-slate-600">
                      Línea: pedido {line.qtyOrdered} u · comprado {line.qtyPurchased} u · estado{" "}
                      <span className={purchaseStatusClass(line.purchaseStatus)}>{line.purchaseStatus}</span>
                    </p>
                    {line.substitutionProductName && (
                      <p className="mt-1 text-xs text-violet-800">Sustitución: {line.substitutionProductName}</p>
                    )}
                    {line.purchaseNote && <p className="mt-1 text-xs text-amber-900">Nota: {line.purchaseNote}</p>}
                  </li>
                );
              })}
            </ul>
            <Link href={`/driver/compras/${r.productId}`} className="mt-3 inline-block text-sm font-semibold text-indigo-700">
              Editar compra de este producto
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
