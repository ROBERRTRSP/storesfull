"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminComprasPage() {
  const { purchases } = useAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Compras</h1>
        <p className="text-sm text-slate-600">Ciclos, proveedores, costo estimado vs real</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Ciclo</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="hidden px-3 py-2 md:table-cell">Comprador</th>
              <th className="px-3 py-2">Líneas</th>
              <th className="px-3 py-2">Est. / Real</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {purchases.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2 font-medium">{p.cycleName}</td>
                <td className="px-3 py-2">{p.date}</td>
                <td className="hidden px-3 py-2 md:table-cell">{p.buyerName}</td>
                <td className="px-3 py-2">{p.linesCount}</td>
                <td className="px-3 py-2">
                  ${p.estCost.toFixed(0)} / {p.realCost > 0 ? `$${p.realCost.toFixed(2)}` : "—"}
                </td>
                <td className="px-3 py-2 capitalize">{p.status}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/compras/${p.id}`} className="text-indigo-700">
                    Auditar
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
