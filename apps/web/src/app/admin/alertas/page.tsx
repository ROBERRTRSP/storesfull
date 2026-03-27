"use client";

import { useAdmin } from "@/components/admin/admin-context";
import { AlertSeverityBadge, AlertStateBadge } from "@/components/admin/badges";
import type { AlertState } from "@/components/admin/types";

export default function AdminAlertasPage() {
  const { alerts, setAlertState } = useAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Alertas e incidencias</h1>
        <p className="text-sm text-slate-600">Operación: retrasos, deudas, parciales y fallas</p>
      </div>
      <ul className="space-y-3">
        {alerts.map((a) => (
          <li key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{a.title}</p>
                <p className="mt-1 text-sm text-slate-600">{a.detail}</p>
                <p className="mt-2 text-xs text-slate-500">{a.createdAt}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <AlertSeverityBadge s={a.severity} />
                <AlertStateBadge s={a.state} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["pendiente", "revisado", "resuelto"] as AlertState[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAlertState(a.id, s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    a.state === s ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
