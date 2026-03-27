"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useClientData } from "@/components/cliente/client-context";
import { OrderStatusBadge } from "@/components/cliente/order-status-badge";

export default function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { orders, products, getOrderTotal, repeatOrder } = useClientData();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return <p className="rounded-lg border bg-white p-4 text-sm">Pedido no encontrado.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Pedido #{order.orderNumber ?? order.id}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">Fecha: {order.createdAt}</p>
      </div>
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Productos</h2>
        <div className="mt-3 space-y-2">
          {order.items.map((it) => {
            const p = products.find((x) => x.id === it.productId);
            return (
              <div key={it.productId} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <span>{p?.name}</span>
                <span>
                  {it.qty} x ${p?.price.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-right font-semibold">Total: ${getOrderTotal(order).toFixed(2)}</p>
      </section>
      <div className="grid gap-2 sm:grid-cols-3">
        <button onClick={() => repeatOrder(order.id)} className="rounded-lg border px-3 py-2 text-sm">
          Repetir pedido
        </button>
        <Link href="/cliente/documentos" className="rounded-lg border px-3 py-2 text-center text-sm">
          Ver factura/recibo
        </Link>
        <Link href="/cliente/ayuda" className="rounded-lg bg-slate-900 px-3 py-2 text-center text-sm text-white">
          Contactar soporte
        </Link>
      </div>
    </div>
  );
}

