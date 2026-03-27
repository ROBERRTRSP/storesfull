"use client";

import { useClientData } from "@/components/cliente/client-context";

export default function BalancePage() {
  const { pendingBalance, payments } = useClientData();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Mi balance</h1>
      <section className="rounded-xl bg-slate-900 p-4 text-white">
        <p className="text-sm text-slate-300">Balance pendiente</p>
        <p className="mt-1 text-3xl font-bold">${pendingBalance.toFixed(2)}</p>
      </section>
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Pagos realizados</h2>
        <div className="mt-3 space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <span>{p.date}</span>
              <span>{p.method}</span>
              <span className="font-medium">${p.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

