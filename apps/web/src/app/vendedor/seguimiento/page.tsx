"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSeller } from "@/components/vendedor/seller-context";
import type { FollowUpStatus } from "@/components/vendedor/types";

const statusLabels: Record<FollowUpStatus, string> = {
  pendiente: "Pendiente",
  visitado: "Visitado",
  reagendado: "Reagendado",
  no_encontrado: "No encontrado",
  pedido_creado: "Pedido creado",
  pedido_pendiente_confirmar: "Pedido por confirmar",
  cliente_inactivo: "Cliente inactivo",
  cliente_recuperado: "Cliente recuperado",
};

export default function VendedorSeguimientoPage() {
  const { followUps, customers, addFollowUp, updateFollowUpStatus } = useSeller();
  const [customerId, setCustomerId] = useState("c1");
  const [text, setText] = useState("");

  const onAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addFollowUp(customerId, text.trim(), "pendiente");
    setText("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Seguimiento comercial</h1>
        <p className="text-sm text-slate-600">Notas internas para tu proxima visita</p>
      </div>

      <form onSubmit={onAdd} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Nueva nota</h2>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.businessName}
            </option>
          ))}
        </select>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ej.: Cliente quiere visita el jueves; ofrecer combo arroz..."
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm"
        />
        <button type="submit" className="mt-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
          Guardar seguimiento
        </button>
      </form>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Registro</h2>
        <ul className="space-y-3">
          {followUps.map((f) => {
            const c = customers.find((x) => x.id === f.customerId);
            return (
              <li key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{c?.businessName ?? f.customerId}</p>
                    <p className="text-sm text-slate-600">{f.text}</p>
                    <p className="mt-1 text-xs text-slate-400">{f.createdAt}</p>
                  </div>
                  <select
                    value={f.status}
                    onChange={(e) => updateFollowUpStatus(f.id, e.target.value as FollowUpStatus)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  >
                    {(Object.keys(statusLabels) as FollowUpStatus[]).map((k) => (
                      <option key={k} value={k}>
                        {statusLabels[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <Link href={`/vendedor/clientes/${f.customerId}`} className="mt-2 inline-block text-xs text-emerald-700">
                  Ver cliente
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
