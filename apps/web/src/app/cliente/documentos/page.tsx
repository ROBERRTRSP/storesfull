"use client";

import { useClientData } from "@/components/cliente/client-context";

export default function DocumentosPage() {
  const { documents } = useClientData();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Facturas y recibos</h1>
      <div className="space-y-2">
        {documents.map((d) => (
          <article key={d.id} className="rounded-xl border bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {d.type} #{d.number}
                </p>
                <p className="text-xs text-slate-500">
                  Pedido: {d.orderNumber ?? d.orderId}
                </p>
              </div>
              <div className="text-right text-sm">
                <p>{d.date}</p>
                <p className="font-semibold">${d.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button className="rounded-lg border px-3 py-1 text-xs">Ver</button>
              <button className="rounded-lg border px-3 py-1 text-xs">Descargar</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

