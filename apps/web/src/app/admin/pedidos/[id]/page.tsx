"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdmin } from "@/components/admin/admin-context";
import { OrderStatusBadge } from "@/components/admin/badges";

export default function AdminPedidoDetallePage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { getOrder } = useAdmin();
  const o = getOrder(id);

  if (!o) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center">
        <p className="text-slate-600">Pedido no encontrado.</p>
        <Link href="/admin/pedidos" className="mt-2 inline-block text-indigo-700">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pedidos" className="text-sm text-indigo-700 hover:underline">
          ← Pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">Pedido #{o.number}</h1>
          <OrderStatusBadge status={o.status} />
        </div>
        <p className="text-sm text-slate-600">
          {o.customerName} · {o.date} · Creado por {o.createdBy}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Vendedor</p>
          <p className="mt-1 font-semibold">{o.sellerName}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Ruta</p>
          <p className="mt-1 font-semibold">{o.routeLabel ?? "—"}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Total</p>
          <p className="mt-1 text-lg font-bold">${o.total.toFixed(2)}</p>
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Líneas (demo)</h2>
        <p className="mt-2 text-sm text-slate-600">En producción: productos, cantidades, sustituciones e incidencias.</p>
        <ul className="mt-3 divide-y text-sm">
          <li className="flex justify-between py-2">
            <span>Arroz 1kg × 4</span>
            <span>$10.00</span>
          </li>
          <li className="flex justify-between py-2">
            <span>Aceite 1L × 2</span>
            <span>$8.40</span>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
        <h2 className="font-semibold text-indigo-950">Timeline / acciones</h2>
        <ul className="mt-2 space-y-2 text-sm text-indigo-950/90">
          <li>• Confirmar pedido · Cancelar (reglas por estado)</li>
          <li>• Ver compra consolidada y entrega asociada</li>
          <li>• Registrar pago o ajuste autorizado</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
            Confirmar (demo)
          </button>
          <button type="button" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm">
            Cancelar (demo)
          </button>
        </div>
      </section>
    </div>
  );
}
