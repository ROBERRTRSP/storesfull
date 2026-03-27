"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { paymentMethodLabel } from "@/components/conductor/badges";
import { useConductor } from "@/components/conductor/conductor-context";

export default function ConductorCobrosHistorialPage() {
  const { payments, customers } = useConductor();
  const [method, setMethod] = useState<string>("");

  const rows = useMemo(() => {
    return payments.filter((p) => {
      if (!method) return true;
      return p.splits.some((s) => s.method === method);
    });
  }, [payments, method]);

  const name = (id: string) => customers.find((c) => c.id === id)?.businessName ?? id;

  return (
    <div className="space-y-4">
      <div>
        <Link href="/conductor/cobros" className="text-sm font-medium text-indigo-700">
          ← Cobros
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">Historial de cobros</h1>
      </div>

      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="">Todos los métodos</option>
        <option value="efectivo">Efectivo</option>
        <option value="zelle">Zelle</option>
        <option value="transferencia">Transferencia</option>
        <option value="cash_app">Cash App</option>
        <option value="credito_pendiente">Crédito</option>
        <option value="otro">Otro</option>
      </select>

      <ul className="space-y-2">
        {rows.map((p) => (
          <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
            <p className="font-bold text-slate-900">${p.amount.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{name(p.customerId)}</p>
            <p className="text-xs text-slate-600">
              {p.splits.map((s) => `${paymentMethodLabel(s.method)} $${s.amount.toFixed(2)}`).join(" · ")}
            </p>
            <p className="text-[10px] text-slate-400">
              {p.at} · {p.orderIds.join(", ")}
            </p>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="text-center text-sm text-slate-500">Sin registros.</p>}
    </div>
  );
}
