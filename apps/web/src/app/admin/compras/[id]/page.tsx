"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminCompraDetallePage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { purchases } = useAdmin();
  const p = useMemo(() => purchases.find((x) => x.id === id), [purchases, id]);

  if (!p) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center">
        <p>Compra no encontrada.</p>
        <Link href="/admin/compras" className="mt-2 inline-block text-indigo-700">
          Volver
        </Link>
      </div>
    );
  }

  const diff = p.realCost > 0 ? p.realCost - p.estCost : null;

  return (
    <div className="space-y-6">
      <Link href="/admin/compras" className="text-sm text-indigo-700 hover:underline">
        ← Compras
      </Link>
      <h1 className="text-xl font-bold">{p.cycleName}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Estimado</p>
          <p className="text-lg font-bold">${p.estCost.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Real</p>
          <p className="text-lg font-bold">{p.realCost > 0 ? `$${p.realCost.toFixed(2)}` : "Pendiente"}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Diferencia</p>
          <p className={`text-lg font-bold ${diff != null && diff > 0 ? "text-red-700" : diff != null ? "text-emerald-700" : "text-slate-600"}`}>
            {diff != null ? `${diff >= 0 ? "+" : ""}$${diff.toFixed(2)}` : "—"}
          </p>
        </div>
      </div>
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Resumen de la corrida</h2>
        <p className="mt-2 text-sm text-slate-600">
          Comprador: {p.buyerName} · {p.linesCount} líneas · estado: {p.status}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          El detalle línea a línea (faltantes, sustituciones, comprobantes) se puede ampliar conectando este id al módulo de compras en backend.
        </p>
      </section>
    </div>
  );
}
