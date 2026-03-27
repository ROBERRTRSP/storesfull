"use client";

import Link from "next/link";
import { useSeller, telLink, waLink } from "@/components/vendedor/seller-context";
import type { VisitStatus } from "@/components/vendedor/types";

const statusOptions: VisitStatus[] = [
  "pendiente",
  "visitado",
  "no_encontrado",
  "reagendado",
  "pedido_creado",
  "sin_pedido",
  "seguimiento_pendiente",
];

export default function VendedorRutaPage() {
  const { visitsToday, customers, updateVisitStatus } = useSeller();
  const sorted = [...visitsToday].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Ruta del dia</h1>
        <p className="text-sm text-slate-600">Agenda comercial · orden sugerido</p>
      </div>

      <ol className="space-y-3">
        {sorted.map((v, i) => {
          const c = customers.find((x) => x.id === v.customerId);
          if (!c) return null;
          return (
            <li key={v.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{c.businessName}</p>
                  <p className="text-sm text-slate-600">{c.address}</p>
                  <p className="text-xs text-slate-500">{c.zone} · {c.phone}</p>
                  {v.quickNote && <p className="mt-1 text-xs text-amber-800">Nota: {v.quickNote}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a href={telLink(c.phone)} className="rounded-lg border px-3 py-1 text-xs">
                      Llamar
                    </a>
                    <a href={waLink(c.phone)} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white">
                      WhatsApp
                    </a>
                    {c.gpsLink && (
                      <a href={c.gpsLink} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-200 px-3 py-1 text-xs text-emerald-800">
                        GPS
                      </a>
                    )}
                    <Link href={`/vendedor/clientes/${c.id}`} className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white">
                      Perfil
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="text-xs text-slate-500">Estado visita</label>
                    <select
                      value={v.status}
                      onChange={(e) => updateVisitStatus(v.id, e.target.value as VisitStatus)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
