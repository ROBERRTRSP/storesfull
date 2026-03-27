"use client";

import { useSeller } from "@/components/vendedor/seller-context";

const typeLabel: Record<string, string> = {
  descuento_cantidad: "Descuento por cantidad",
  combo: "Combo",
  temporal: "Promocion temporal",
  destacado: "Producto destacado",
  volumen: "Incentivo por volumen",
};

export default function VendedorOfertasPage() {
  const { offers } = useSeller();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Ofertas activas</h1>
        <p className="text-sm text-slate-600">Para proponer en visita · sin costos internos</p>
      </div>
      <ul className="space-y-3">
        {offers.map((o) => (
          <li key={o.id} className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-emerald-800">{typeLabel[o.type] ?? o.type}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{o.title}</h2>
            <p className="mt-1 text-sm text-slate-700">{o.description}</p>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium">Productos:</span> {o.productNames.join(", ")}
            </p>
            <p className="mt-1 text-xs text-slate-500">Vigencia hasta {o.validUntil}</p>
            {o.suggestedForZones && o.suggestedForZones.length > 0 && (
              <p className="mt-1 text-xs text-emerald-800">Ideal para: {o.suggestedForZones.join(", ")}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
