"use client";

import Link from "next/link";
import { useMemo } from "react";
import { routeVisitClass } from "@/components/conductor/badges";
import { orderSaleTotal, amountPendingOrder } from "@/components/conductor/aggregate";
import { useConductor } from "@/components/conductor/conductor-context";

export default function ConductorRutaPage() {
  const { customers, orders, routeVisitStatus, setRouteVisitStatus } = useConductor();

  const stops = useMemo(() => {
    const ids = new Set(orders.map((o) => o.customerId));
    return customers
      .filter((c) => ids.has(c.id))
      .sort((a, b) => a.visitOrder - b.visitOrder)
      .map((c) => {
        const os = orders.filter((o) => o.customerId === c.id);
        const totalEntregar = os.reduce((s, o) => s + orderSaleTotal(o), 0);
        const pendCobro = os.reduce((s, o) => s + amountPendingOrder(o), 0);
        return { customer: c, orders: os, totalEntregar, pendCobro };
      });
  }, [customers, orders]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Ruta del día</h1>
        <p className="text-sm text-slate-600">Clientes con pedidos · orden de visita</p>
      </div>

      <ol className="space-y-3">
        {stops.map(({ customer: c, orders: os, totalEntregar, pendCobro }, idx) => {
          const st = routeVisitStatus[c.id] ?? "pendiente";
          return (
            <li key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-indigo-600">Parada {idx + 1}</p>
                  <h2 className="text-lg font-bold text-slate-900">{c.businessName}</h2>
                  <p className="text-sm text-slate-600">{c.address}</p>
                  <p className="text-xs text-slate-500">{c.zone}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${routeVisitClass(st)}`}>{st}</span>
              </div>
              <p className="mt-2 text-sm">
                {os.length} pedido{os.length !== 1 ? "s" : ""} · Total venta ${totalEntregar.toFixed(2)} · Pendiente cobro $
                {pendCobro.toFixed(2)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`tel:${c.phone.replace(/\s/g, "")}`}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  Llamar
                </a>
                <a
                  href={c.gpsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                >
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
                <Link
                  href={`/driver/ruta/cliente/${c.id}`}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white"
                >
                  Entrega / checklist
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {(["pendiente", "en_ruta", "visitado", "entregado", "parcial", "no_entregado", "reagendado"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRouteVisitStatus(c.id, s)}
                      className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-700"
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
