"use client";

import Link from "next/link";
import { useClientData } from "@/components/cliente/client-context";
import { OrderStatusBadge } from "@/components/cliente/order-status-badge";

export default function ClienteInicioPage() {
  const { pendingBalance, orders, products, repeatOrder } = useClientData();
  const lastOrder = orders[0];
  const processCount = orders.filter((o) =>
    ["confirmado", "pendiente_de_compra", "en_compra", "comprado", "en_ruta"].includes(o.status),
  ).length;
  const frequent = products.slice(0, 4);
  const offers = products.filter((p) => p.promo).slice(0, 3);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl bg-slate-900 p-4 text-white">
          <p className="text-xs text-slate-300">Balance pendiente</p>
          <p className="mt-1 text-2xl font-bold">${pendingBalance.toFixed(2)}</p>
          <Link href="/cliente/balance" className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-sm text-slate-900">
            Ver balance
          </Link>
        </article>
        <article className="rounded-xl border bg-white p-4">
          <p className="text-xs text-slate-500">Ultimo pedido</p>
          {lastOrder ? (
            <>
              <p className="mt-1 font-semibold">#{lastOrder.orderNumber ?? lastOrder.id}</p>
              <div className="mt-2">
                <OrderStatusBadge status={lastOrder.status} />
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Aun no tienes pedidos</p>
          )}
        </article>
        <article className="rounded-xl border bg-white p-4">
          <p className="text-xs text-slate-500">Pedidos en proceso</p>
          <p className="mt-1 text-2xl font-bold">{processCount}</p>
        </article>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Acciones rapidas</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Link href="/cliente/catalogo" className="rounded-lg bg-slate-900 px-3 py-2 text-center text-sm text-white">
            Pedir ahora
          </Link>
          <button
            onClick={() => lastOrder && repeatOrder(lastOrder.id)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Repetir pedido
          </button>
          <Link href="/cliente/balance" className="rounded-lg border px-3 py-2 text-center text-sm">
            Ver balance
          </Link>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Productos frecuentes</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {frequent.map((p) => (
            <div key={p.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-slate-500">${p.price.toFixed(2)} / {p.unit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Ofertas activas</h2>
        <div className="mt-3 space-y-2">
          {offers.length === 0 && <p className="text-sm text-slate-500">No hay ofertas hoy.</p>}
          {offers.map((o) => (
            <div key={o.id} className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              {o.name}: {o.promo}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

