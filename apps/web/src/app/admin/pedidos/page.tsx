"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { OrderStatusBadge } from "@/components/admin/badges";
import type { AdminOrderStatus } from "@/components/admin/types";

const statuses: AdminOrderStatus[] = [
  "borrador",
  "confirmado",
  "pendiente_compra",
  "en_compra",
  "comprado",
  "en_ruta",
  "entregado",
  "parcial",
  "cancelado",
  "pendiente_pago",
  "pagado",
];

export default function AdminPedidosPage() {
  const { orders } = useAdmin();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AdminOrderStatus | "todos">("todos");

  const filtered = useMemo(() => {
    let list = [...orders];
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (o) =>
          o.number.includes(qq) ||
          o.customerName.toLowerCase().includes(qq) ||
          o.sellerName.toLowerCase().includes(qq) ||
          (o.routeLabel?.toLowerCase().includes(qq) ?? false),
      );
    }
    if (status !== "todos") list = list.filter((o) => o.status === status);
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [orders, q, status]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pedidos</h1>
        <p className="text-sm text-slate-600">Todos los estados del flujo operativo</p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar #pedido, cliente, vendedor, ruta..."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setStatus("todos")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${status === "todos" ? "bg-slate-900 text-white" : "border bg-white"}`}
        >
          Todos
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm capitalize ${status === s ? "bg-indigo-600 text-white" : "border bg-white"}`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="hidden px-3 py-2 lg:table-cell">Vendedor</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2 font-mono text-xs">#{o.number}</td>
                <td className="px-3 py-2">
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-xs text-slate-500">{o.date}</p>
                </td>
                <td className="hidden px-3 py-2 lg:table-cell">{o.sellerName}</td>
                <td className="px-3 py-2 font-medium">${o.total.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-indigo-700">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">Exportar CSV / Excel / PDF: conectar desde reportes o acción masiva.</p>
    </div>
  );
}
