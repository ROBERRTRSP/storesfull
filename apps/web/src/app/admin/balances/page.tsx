"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminBalancesPage() {
  const { customers } = useAdmin();
  const [seller, setSeller] = useState<string>("todos");

  const sellers = useMemo(() => {
    const s = new Set(customers.map((c) => c.sellerName));
    return ["todos", ...Array.from(s)];
  }, [customers]);

  const withDebt = useMemo(() => {
    let list = customers.filter((c) => c.balancePending > 0);
    if (seller !== "todos") list = list.filter((c) => c.sellerName === seller);
    return list.sort((a, b) => b.balancePending - a.balancePending);
  }, [customers, seller]);

  const totalPending = withDebt.reduce((a, c) => a + c.balancePending, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Cuentas por cobrar</h1>
        <p className="text-sm text-slate-600">Deuda por cliente, antigüedad, ruta y riesgo de crédito</p>
      </div>
      <div className="rounded-xl border border-red-100 bg-red-50/90 p-4">
        <p className="text-sm text-red-900">Balance total pendiente (filtrado)</p>
        <p className="text-2xl font-bold text-red-800">${totalPending.toFixed(2)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {sellers.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeller(s)}
            className={`rounded-full px-3 py-1.5 text-sm ${seller === s ? "bg-slate-900 text-white" : "border bg-white"}`}
          >
            {s === "todos" ? "Todos los vendedores" : s}
          </button>
        ))}
        <button type="button" className="ml-auto rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm">
          Exportar CSV (demo)
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Cliente</th>
              <th className="hidden px-3 py-2 md:table-cell">Zona</th>
              <th className="px-3 py-2">Vendedor</th>
              <th className="px-3 py-2">Deuda</th>
              <th className="px-3 py-2">Límite crédito</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {withDebt.map((c) => {
              const over = c.balancePending > c.creditLimit * 0.5;
              return (
                <tr key={c.id} className={over ? "bg-amber-50/50" : ""}>
                  <td className="px-3 py-2 font-medium">{c.businessName}</td>
                  <td className="hidden px-3 py-2 md:table-cell">{c.zone}</td>
                  <td className="px-3 py-2">{c.sellerName}</td>
                  <td className="px-3 py-2 font-semibold text-red-700">${c.balancePending.toFixed(2)}</td>
                  <td className="px-3 py-2">${c.creditLimit.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">
                    <Link href={`/admin/clientes/${c.id}`} className="text-indigo-700">
                      Ficha
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {withDebt.length === 0 && <p className="text-sm text-slate-500">Ningún cliente con saldo en este filtro.</p>}
    </div>
  );
}
