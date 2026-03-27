"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminPagosPage() {
  const { payments } = useAdmin();
  const [method, setMethod] = useState<string>("todos");

  const methods = useMemo(() => {
    const s = new Set(payments.map((p) => p.method));
    return ["todos", ...Array.from(s)];
  }, [payments]);

  const filtered = useMemo(() => {
    if (method === "todos") return payments;
    return payments.filter((p) => p.method === method);
  }, [payments, method]);

  const total = filtered.reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pagos y cobros</h1>
        <p className="text-sm text-slate-600">Por cliente, delivery, método y comprobantes</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {methods.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            className={`rounded-full px-3 py-1.5 text-sm capitalize ${method === m ? "bg-slate-900 text-white" : "border bg-white"}`}
          >
            {m}
          </button>
        ))}
        <span className="ml-auto text-sm font-semibold text-slate-800">Total filtrado: ${total.toFixed(2)}</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Monto</th>
              <th className="px-3 py-2">Método</th>
              <th className="hidden px-3 py-2 lg:table-cell">Pedido</th>
              <th className="hidden px-3 py-2 lg:table-cell">Registró</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2">{p.date}</td>
                <td className="px-3 py-2 font-medium">{p.customerName}</td>
                <td className="px-3 py-2 font-semibold">${p.amount.toFixed(2)}</td>
                <td className="px-3 py-2 capitalize">{p.method}</td>
                <td className="hidden px-3 py-2 lg:table-cell">{p.orderRef ?? "—"}</td>
                <td className="hidden px-3 py-2 lg:table-cell">{p.recordedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
        <p className="text-sm font-medium text-slate-800">Ajustes manuales autorizados</p>
        <p className="mt-1 text-sm text-slate-600">Formulario con motivo, aprobación y trazabilidad en auditoría.</p>
        <button type="button" className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">
          Registrar ajuste (demo)
        </button>
      </div>
    </div>
  );
}
