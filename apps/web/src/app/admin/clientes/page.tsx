"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminClientesPage() {
  const { customers } = useAdmin();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todos" | "activos" | "deuda" | "inactivos">("todos");

  const filtered = useMemo(() => {
    let list = [...customers];
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (c) =>
          c.businessName.toLowerCase().includes(qq) ||
          c.contactName.toLowerCase().includes(qq) ||
          c.phone.replace(/\D/g, "").includes(qq.replace(/\D/g, "")) ||
          c.zone.toLowerCase().includes(qq) ||
          c.email.toLowerCase().includes(qq),
      );
    }
    if (filter === "activos") list = list.filter((c) => c.active);
    if (filter === "deuda") list = list.filter((c) => c.balancePending > 0);
    if (filter === "inactivos") list = list.filter((c) => !c.active);
    return list;
  }, [customers, q, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-600">Cartera, crédito y seguimiento comercial</p>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nuevo cliente
        </Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar negocio, contacto, teléfono, zona..."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["todos", "Todos"],
            ["activos", "Activos"],
            ["deuda", "Con deuda"],
            ["inactivos", "Inactivos"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${filter === key ? "bg-slate-900 text-white" : "border border-slate-200 bg-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Negocio</th>
              <th className="hidden px-3 py-2 md:table-cell">Zona / día</th>
              <th className="hidden px-3 py-2 lg:table-cell">Vendedor</th>
              <th className="px-3 py-2">Balance</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80">
                <td className="px-3 py-2">
                  <p className="font-medium text-slate-900">{c.businessName}</p>
                  <p className="text-xs text-slate-500 md:hidden">
                    {c.zone} · {c.visitDay}
                  </p>
                </td>
                <td className="hidden px-3 py-2 text-slate-600 md:table-cell">
                  {c.zone} · {c.visitDay}
                </td>
                <td className="hidden px-3 py-2 text-slate-600 lg:table-cell">{c.sellerName}</td>
                <td className="px-3 py-2">
                  <span className={c.balancePending > 0 ? "font-semibold text-red-700" : "text-slate-600"}>
                    ${c.balancePending.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/clientes/${c.id}`} className="text-indigo-700 hover:underline">
                    Ficha
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
