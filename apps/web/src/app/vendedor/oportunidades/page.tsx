"use client";

import Link from "next/link";
import { useSeller } from "@/components/vendedor/seller-context";

export default function VendedorOportunidadesPage() {
  const { opportunities } = useSeller();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Oportunidades de venta</h1>
        <p className="text-sm text-slate-600">Pistas para ofrecer mas en cada visita</p>
      </div>
      <ul className="space-y-3">
        {opportunities.map((o) => (
          <li key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{o.customerName}</p>
                <p className="text-sm font-medium text-emerald-800">{o.title}</p>
                <p className="mt-1 text-sm text-slate-600">{o.detail}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  o.priority === "alta" ? "bg-rose-100 text-rose-800" : o.priority === "media" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"
                }`}
              >
                {o.priority}
              </span>
            </div>
            <Link href={`/vendedor/clientes/${o.customerId}/pedido`} className="mt-3 inline-block text-sm font-semibold text-emerald-700">
              Crear pedido
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
