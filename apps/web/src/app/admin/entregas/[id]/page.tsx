"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminEntregaDetallePage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { deliveries } = useAdmin();
  const d = useMemo(() => deliveries.find((x) => x.id === id), [deliveries, id]);

  if (!d) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center">
        <p>Entrega no encontrada.</p>
        <Link href="/admin/entregas" className="text-indigo-700">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/entregas" className="text-sm text-indigo-700 hover:underline">
        ← Entregas
      </Link>
      <h1 className="text-xl font-bold">
        {d.routeLabel} · {d.date}
      </h1>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Delivery: <span className="font-medium text-slate-900">{d.deliveryUser}</span>
        </p>
        <p className="mt-2 text-sm">
          Estado: <span className="capitalize">{d.status}</span>
        </p>
      </div>
      <section className="rounded-2xl border bg-slate-50 p-4">
        <h2 className="font-semibold">Checklist y notas (demo)</h2>
        <p className="mt-2 text-sm text-slate-600">Pedidos en ruta, firmas, fotos, incidencias — datos reales desde API.</p>
        <button type="button" className="mt-3 rounded-lg border bg-white px-4 py-2 text-sm">
          Reasignar ruta (demo)
        </button>
      </section>
    </div>
  );
}
