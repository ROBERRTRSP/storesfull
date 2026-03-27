"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { SellerOpportunity } from "./types";

type DashboardStats = {
  visitasPendientesHoy: number;
  oportunidadesAbiertas: number;
  seguimientosPendientes: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Cierra sesión; el padre debe llamar a logout y cerrar el dialogo. */
  onConfirmLogout: () => void;
  dashboardStats: DashboardStats;
  opportunities: SellerOpportunity[];
};

export function LogoutConfirmDialog({ open, onClose, onConfirmLogout, dashboardStats, opportunities }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="logout-dialog-title" className="text-lg font-bold text-slate-900">
          ¿Cerrar sesión?
        </h2>
        <p className="mt-1 text-sm text-slate-600">Resumen rápido antes de salir</p>

        <ul className="mt-4 space-y-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-800">
          <li className="flex justify-between gap-2">
            <span className="text-slate-600">Por visitar hoy</span>
            <span className="font-semibold">{dashboardStats.visitasPendientesHoy}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-slate-600">Oportunidades</span>
            <span className="font-semibold">{dashboardStats.oportunidadesAbiertas}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-slate-600">Seguimiento pendiente</span>
            <span className="font-semibold">{dashboardStats.seguimientosPendientes}</span>
          </li>
        </ul>

        {opportunities.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Oportunidades destacadas</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {opportunities.slice(0, 3).map((o) => (
                <li key={o.id}>
                  <span className="font-medium text-slate-900">{o.customerName}:</span> {o.title}
                </li>
              ))}
            </ul>
            <Link
              href="/vendedor/oportunidades"
              onClick={onClose}
              className="mt-2 inline-block text-sm font-semibold text-emerald-700"
            >
              Ver todas las oportunidades
            </Link>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-900"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
