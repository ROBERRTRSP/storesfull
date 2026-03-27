"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminEntregasPage() {
  const { deliveries } = useAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Entregas y rutas</h1>
        <p className="text-sm text-slate-600">Cumplimiento, parciales y delivery asignado</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Ruta</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="hidden px-3 py-2 md:table-cell">Delivery</th>
              <th className="px-3 py-2">Pedidos</th>
              <th className="px-3 py-2">Hechos / Parcial</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td className="px-3 py-2 font-medium">{d.routeLabel}</td>
                <td className="px-3 py-2">{d.date}</td>
                <td className="hidden px-3 py-2 md:table-cell">{d.deliveryUser}</td>
                <td className="px-3 py-2">{d.ordersCount}</td>
                <td className="px-3 py-2">
                  {d.completed} / {d.partial}
                </td>
                <td className="px-3 py-2 capitalize">{d.status.replace(/_/g, " ")}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/entregas/${d.id}`} className="text-indigo-700">
                    Detalle
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
