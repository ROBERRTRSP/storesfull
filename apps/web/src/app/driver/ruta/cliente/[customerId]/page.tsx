"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { deliveryStatusClass } from "@/components/conductor/badges";
import { amountPendingOrder, orderSaleTotal } from "@/components/conductor/aggregate";
import { useConductor } from "@/components/conductor/conductor-context";
import type { DeliveryLineStatus } from "@/components/conductor/types";

const deliveryOptions: DeliveryLineStatus[] = ["pendiente", "entregado", "parcial", "no_entregado", "sustituido"];

export default function ConductorEntregaClientePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  const { getCustomer, getOrdersForCustomer, updateOrderLineDelivery, confirmAllDeliveredForCustomer, syncOrderStatusFromLines } =
    useConductor();

  const c = getCustomer(customerId);
  const orders = getOrdersForCustomer(customerId);

  if (!c) {
    return (
      <div className="space-y-2">
        <p className="text-slate-600">Cliente no encontrado.</p>
        <Link href="/driver/ruta" className="text-indigo-700">
          Volver a ruta
        </Link>
      </div>
    );
  }

  const totalCliente = orders.reduce((s, o) => s + orderSaleTotal(o), 0);
  const pendiente = orders.reduce((s, o) => s + amountPendingOrder(o), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/driver/ruta" className="text-sm font-medium text-indigo-700">
          ← Ruta
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{c.businessName}</h1>
        <p className="text-sm text-slate-600">{c.contactName}</p>
        <p className="text-sm text-slate-700">{c.address}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">
            Llamar
          </a>
          <a href={c.gpsLink} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-xs font-medium">
            Mapa
          </a>
          <a
            href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Totales del cliente</h2>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Pedidos</dt>
            <dd className="font-bold">{orders.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Venta total</dt>
            <dd className="font-bold">${totalCliente.toFixed(2)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-slate-500">Pendiente de cobro</dt>
            <dd className="text-lg font-bold text-amber-800">${pendiente.toFixed(2)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => {
            confirmAllDeliveredForCustomer(customerId);
            orders.forEach((o) => syncOrderStatusFromLines(o.id));
          }}
          className="mt-3 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white"
        >
          Confirmar todo entregado (según comprado)
        </button>
        <button
          type="button"
          onClick={() => router.push(`/driver/cobros/registrar?cliente=${customerId}`)}
          className="mt-2 w-full rounded-xl border-2 border-emerald-600 py-3 text-sm font-semibold text-emerald-800"
        >
          Ir a cobro
        </button>
      </section>

      {orders.map((o) => (
        <section key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">
              Pedido <span className="font-mono text-sm">{o.id}</span>
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{o.status}</span>
          </div>
          <p className="text-xs text-slate-500">Cobro: {o.paymentStatus} · pagado ${o.amountPaid.toFixed(2)}</p>
          <ul className="mt-3 space-y-3">
            {o.lines.map((l) => (
              <li key={l.productId + o.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{l.productName}</p>
                    <p className="text-xs text-slate-600">
                      Pedido {l.qtyOrdered} · comprado {l.qtyPurchased} · entregado {l.qtyDelivered}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${deliveryStatusClass(l.deliveryStatus)}`}>
                    {l.deliveryStatus}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {deliveryOptions.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className="rounded-full bg-white px-2 py-1 text-[10px] font-medium ring-1 ring-slate-200"
                      onClick={() => {
                        const qty =
                          d === "entregado" ? l.qtyPurchased : d === "no_entregado" ? 0 : l.qtyDelivered;
                        updateOrderLineDelivery(o.id, l.productId, {
                          deliveryStatus: d,
                          qtyDelivered: qty,
                        });
                        syncOrderStatusFromLines(o.id);
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <label className="text-slate-500">Cant. entregada</label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={l.qtyDelivered}
                    id={`dq-${o.id}-${l.productId}`}
                    className="w-16 rounded border px-1 py-1"
                  />
                  <button
                    type="button"
                    className="rounded bg-indigo-100 px-2 py-1 font-medium text-indigo-900"
                    onClick={() => {
                      const el = document.getElementById(`dq-${o.id}-${l.productId}`) as HTMLInputElement | null;
                      const n = Number(el?.value);
                      if (!Number.isFinite(n)) return;
                      updateOrderLineDelivery(o.id, l.productId, {
                        qtyDelivered: n,
                        deliveryStatus: n >= l.qtyPurchased ? "entregado" : n > 0 ? "parcial" : "no_entregado",
                      });
                      syncOrderStatusFromLines(o.id);
                    }}
                  >
                    Aplicar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
