"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminGastosPage() {
  const { expenses } = useAdmin();
  const [type, setType] = useState<string>("todos");

  const types = useMemo(() => {
    const s = new Set(expenses.map((e) => e.type));
    return ["todos", ...Array.from(s)];
  }, [expenses]);

  const filtered = useMemo(() => {
    if (type === "todos") return expenses;
    return expenses.filter((e) => e.type === type);
  }, [expenses, type]);

  const total = filtered.reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gastos</h1>
          <p className="text-sm text-slate-600">Ruta y operativos con comprobante</p>
        </div>
        <button type="button" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          + Registrar gasto (demo)
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1.5 text-sm capitalize ${type === t ? "bg-slate-900 text-white" : "border bg-white"}`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-sm font-semibold">Total: ${total.toFixed(2)}</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Monto</th>
              <th className="hidden px-3 py-2 md:table-cell">Descripción</th>
              <th className="hidden px-3 py-2 lg:table-cell">Usuario</th>
              <th className="hidden px-3 py-2 lg:table-cell">Ruta</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-2">{e.date}</td>
                <td className="px-3 py-2 capitalize">{e.type}</td>
                <td className="px-3 py-2 font-medium">${e.amount.toFixed(2)}</td>
                <td className="hidden px-3 py-2 md:table-cell">{e.description}</td>
                <td className="hidden px-3 py-2 lg:table-cell">{e.userName}</td>
                <td className="hidden px-3 py-2 lg:table-cell">{e.routeRef ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
