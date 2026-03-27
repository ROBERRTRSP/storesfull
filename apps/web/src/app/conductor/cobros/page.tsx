"use client";

import Link from "next/link";
import { useConductor } from "@/components/conductor/conductor-context";
import { paymentMethodLabel } from "@/components/conductor/badges";

export default function ConductorCobrosPage() {
  const { payments, today } = useConductor();
  const hoy = payments.filter((p) => p.at.startsWith(today));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Cobros</h1>
        <p className="text-sm text-slate-600">Registro rápido e historial del día</p>
      </div>

      <Link
        href="/conductor/cobros/registrar"
        className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg"
      >
        + Registrar cobro
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Cobros de hoy</h2>
          <Link href="/conductor/cobros/historial" className="text-sm font-medium text-indigo-700">
            Ver todo
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {hoy.length === 0 && <li className="py-4 text-center text-sm text-slate-500">Sin cobros aún hoy.</li>}
          {hoy.map((p) => (
            <li key={p.id} className="py-3 text-sm">
              <p className="font-medium text-slate-900">${p.amount.toFixed(2)}</p>
              <p className="text-xs text-slate-500">
                {p.splits.map((s) => `${paymentMethodLabel(s.method)} $${s.amount.toFixed(2)}`).join(" · ")}
              </p>
              <p className="text-xs text-slate-400">Pedidos: {p.orderIds.join(", ")}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
