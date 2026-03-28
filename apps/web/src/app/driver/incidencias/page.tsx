"use client";

import { FormEvent, useState } from "react";
import { useConductor } from "@/components/conductor/conductor-context";
import type { IncidentType } from "@/components/conductor/types";

const types: { id: IncidentType; label: string }[] = [
  { id: "producto_no_encontrado", label: "Producto no encontrado" },
  { id: "direccion_incorrecta", label: "Dirección incorrecta" },
  { id: "cliente_ausente", label: "Cliente no estaba" },
  { id: "entrega_parcial", label: "Entrega parcial" },
  { id: "cliente_no_pago", label: "Cliente no pagó" },
  { id: "sustitucion", label: "Sustitución" },
  { id: "reagendado", label: "Reagendado" },
  { id: "problema_pago", label: "Problema con pago" },
  { id: "problema_entrega", label: "Problema en entrega" },
  { id: "otro", label: "Otro" },
];

export default function ConductorIncidenciasPage() {
  const { incidents, customers, orders, addIncident, updateIncidentResolution } = useConductor();
  const [type, setType] = useState<IncidentType>("producto_no_encontrado");
  const [desc, setDesc] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    addIncident({
      type,
      description: desc.trim(),
      customerId: customerId || undefined,
      orderId: orderId || undefined,
    });
    setDesc("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Incidencias</h1>
        <p className="text-sm text-slate-600">Registro rápido en ruta</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-slate-500">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as IncidentType)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Descripción</label>
          <textarea required value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-slate-500">Cliente (opcional)</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm">
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Pedido (opcional)</label>
            <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm">
              <option value="">—</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="w-full rounded-xl bg-rose-600 py-3 text-sm font-bold text-white">
          Registrar incidencia
        </button>
      </form>

      <section>
        <h2 className="font-semibold text-slate-900">Del día</h2>
        <ul className="mt-2 space-y-2">
          {[...incidents].reverse().map((i) => (
            <li key={i.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <p className="font-medium text-slate-900">{i.type}</p>
              <p className="text-slate-700">{i.description}</p>
              <p className="text-xs text-slate-400">
                {i.at} · {i.recordedBy}
              </p>
              <select
                value={i.resolution}
                onChange={(e) => updateIncidentResolution(i.id, e.target.value as "abierta" | "en_curso" | "cerrada")}
                className="mt-2 w-full rounded-lg border px-2 py-1 text-xs"
              >
                <option value="abierta">Abierta</option>
                <option value="en_curso">En curso</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
