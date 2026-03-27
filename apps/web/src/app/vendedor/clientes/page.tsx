"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSeller } from "@/components/vendedor/seller-context";
import type { SellerCustomer } from "@/components/vendedor/types";

type FilterKey =
  | "todos"
  | "hoy"
  | "sin_compra"
  | "balance"
  | "nuevos"
  | "inactivos"
  | "seguimiento";

function daysSince(iso: string | null) {
  if (!iso) return 999;
  const a = new Date(iso).getTime();
  const b = Date.now();
  return Math.floor((b - a) / (86400 * 1000));
}

export default function VendedorClientesPage() {
  const { customers, visitsToday } = useSeller();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("todos");

  const filtered = useMemo(() => {
    let list: SellerCustomer[] = [...customers];
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (c) =>
          c.businessName.toLowerCase().includes(qq) ||
          c.contactName.toLowerCase().includes(qq) ||
          c.phone.replace(/\D/g, "").includes(qq.replace(/\D/g, "")) ||
          c.zone.toLowerCase().includes(qq),
      );
    }
    if (filter === "hoy") {
      const ids = new Set(visitsToday.map((v) => v.customerId));
      list = list.filter((c) => ids.has(c.id));
    }
    if (filter === "sin_compra") list = list.filter((c) => daysSince(c.lastPurchaseDate) >= 14);
    if (filter === "balance") list = list.filter((c) => c.balancePending > 0);
    if (filter === "nuevos") list = list.filter((c) => c.status === "nuevo");
    if (filter === "inactivos") list = list.filter((c) => c.status === "inactivo" || c.status === "riesgo");
    if (filter === "seguimiento") list = list.filter((c) => c.tags.includes("sin_compra") || c.status === "riesgo");
    return list;
  }, [customers, q, filter, visitsToday]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "hoy", label: "Hoy" },
    { key: "sin_compra", label: "Sin compra" },
    { key: "balance", label: "Con balance" },
    { key: "nuevos", label: "Nuevos" },
    { key: "inactivos", label: "Inactivos" },
    { key: "seguimiento", label: "Seguimiento" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
        <p className="text-sm text-slate-600">Tu cartera · sin costos internos</p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por negocio, contacto, telefono, zona..."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === f.key ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.map((c) => (
          <li key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{c.businessName}</p>
                <p className="text-sm text-slate-600">{c.contactName}</p>
                <p className="text-xs text-slate-500">{c.phone} · {c.zone}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  c.status === "activo"
                    ? "bg-emerald-100 text-emerald-800"
                    : c.status === "nuevo"
                      ? "bg-blue-100 text-blue-800"
                      : c.status === "riesgo"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-slate-100 text-slate-700"
                }`}
              >
                {c.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
              <div>
                <p className="text-slate-400">Ultima compra</p>
                <p className="font-medium text-slate-800">{c.lastPurchaseDate ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-400">Frecuencia</p>
                <p className="font-medium text-slate-800">~{c.purchaseFrequencyDays} d</p>
              </div>
              <div>
                <p className="text-slate-400">Ticket prom.</p>
                <p className="font-medium text-slate-800">${c.avgTicket.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-slate-400">Balance</p>
                <p className="font-medium text-slate-800">${c.balancePending.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/vendedor/clientes/${c.id}`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Ver perfil
              </Link>
              <Link
                href={`/vendedor/clientes/${c.id}/pedido`}
                className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-800"
              >
                Crear pedido
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Sin resultados.</p>}
    </div>
  );
}
