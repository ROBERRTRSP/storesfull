"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminAuditoriaPage() {
  const { audit } = useAdmin();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return audit;
    return audit.filter(
      (a) =>
        a.user.toLowerCase().includes(qq) ||
        a.action.toLowerCase().includes(qq) ||
        a.entity.toLowerCase().includes(qq) ||
        a.detail.toLowerCase().includes(qq),
    );
  }, [audit, q]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Historial y auditoría</h1>
        <p className="text-sm text-slate-600">Quién hizo qué y cuándo</p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filtrar por usuario, acción, entidad..."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />
      <ul className="space-y-2">
        {filtered.map((a) => (
          <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-500">{a.at}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                {a.action} · {a.entity}
              </span>
            </div>
            <p className="mt-2 text-slate-800">
              <span className="font-medium text-indigo-800">{a.user}</span> — {a.detail}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
