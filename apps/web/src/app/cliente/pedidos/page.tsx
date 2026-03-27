"use client";

import Link from "next/link";
import { useState } from "react";
import { useClientData } from "@/components/cliente/client-context";
import { OrderStatusBadge } from "@/components/cliente/order-status-badge";
import { OrderStatus } from "@/components/cliente/types";

const statuses: ("all" | OrderStatus)[] = [
  "all",
  "borrador",
  "confirmado",
  "pendiente_de_compra",
  "en_compra",
  "en_ruta",
  "entregado",
  "parcial",
  "cancelado",
  "pendiente_de_pago",
  "pagado",
];

export default function PedidosPage() {
  const { orders, getOrderTotal, repeatOrder } = useClientData();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Mis pedidos</h1>
      <div className="flex gap-2 overflow-auto pb-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${filter === s ? "bg-slate-900 text-white" : "border bg-white"}`}
          >
            {s === "all" ? "Todos" : s.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {list.length === 0 && <p className="rounded-lg border bg-white p-3 text-sm text-slate-500">No hay pedidos en este estado.</p>}
        {list.map((o) => (
          <article key={o.id} className="rounded-xl border bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">#{o.orderNumber ?? o.id}</p>
                <p className="text-xs text-slate-500">{o.createdAt}</p>
              </div>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="mt-2 text-sm">Total: ${getOrderTotal(o).toFixed(2)}</p>
            <div className="mt-3 flex gap-2">
              <Link href={`/cliente/pedidos/${o.id}`} className="rounded-lg border px-3 py-2 text-xs">
                Ver detalle
              </Link>
              <button onClick={() => repeatOrder(o.id)} className="rounded-lg border px-3 py-2 text-xs">
                Repetir
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

