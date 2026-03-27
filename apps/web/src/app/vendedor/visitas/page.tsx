"use client";

import { useSeller } from "@/components/vendedor/seller-context";

export default function VendedorHistorialVisitasPage() {
  const { visitsToday, customers } = useSeller();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Historial de visitas</h1>
        <p className="text-sm text-slate-600">Registro del dia (demo) · ampliable a historico real</p>
      </div>
      <ul className="space-y-2">
        {visitsToday.map((v) => {
          const c = customers.find((x) => x.id === v.customerId);
          return (
            <li key={v.id} className="flex justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div>
                <p className="font-medium">{c?.businessName}</p>
                <p className="text-xs text-slate-500">
                  {v.date} · {v.status}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
