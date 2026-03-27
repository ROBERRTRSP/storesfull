"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdmin } from "@/components/admin/admin-context";
import { OrderStatusBadge } from "@/components/admin/badges";

export default function AdminClienteDetallePage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { getCustomer, getOrdersForCustomer } = useAdmin();
  const c = getCustomer(id);
  const orders = getOrdersForCustomer(id);

  if (!c) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-slate-600">Cliente no encontrado.</p>
        <Link href="/admin/clientes" className="mt-2 inline-block text-indigo-700">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/clientes" className="text-sm text-indigo-700 hover:underline">
            ← Clientes
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{c.businessName}</h1>
          <p className="text-sm text-slate-600">
            {c.contactName} · {c.phone} · {c.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            Editar (demo)
          </button>
          <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            {c.active ? "Desactivar" : "Activar"} (demo)
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Zona / ruta</p>
          <p className="mt-1 font-semibold">{c.zone}</p>
          <p className="text-sm text-slate-600">Visita: {c.visitDay}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Vendedor</p>
          <p className="mt-1 font-semibold">{c.sellerName}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Crédito</p>
          <p className="mt-1 font-semibold">${c.creditLimit.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/80 p-4 shadow-sm">
          <p className="text-xs uppercase text-red-800/80">Balance pendiente</p>
          <p className="mt-1 text-lg font-bold text-red-800">${c.balancePending.toFixed(2)}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Comportamiento</h2>
        <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <li>
            <span className="text-slate-500">Última compra:</span> {c.lastPurchase ?? "—"}
          </li>
          <li>
            <span className="text-slate-500">Estado:</span> {c.active ? "Activo" : "Inactivo"}
          </li>
        </ul>
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Notas internas (demo):</span> Cliente frecuente en granos y despensa.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Historial de pedidos</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium text-slate-900">
                  Pedido #{o.number} · ${o.total.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">{o.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={o.status} />
                <Link href={`/admin/pedidos/${o.id}`} className="text-sm text-indigo-700">
                  Detalle
                </Link>
              </div>
            </li>
          ))}
        </ul>
        {orders.length === 0 && <p className="text-sm text-slate-500">Sin pedidos.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Historial de pagos (vinculado a pedidos)</h2>
        <p className="mt-2 text-sm text-slate-600">En producción: lista de cobros y comprobantes por cliente.</p>
      </section>
    </div>
  );
}
