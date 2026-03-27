"use client";

import Link from "next/link";

export default function AdminClienteNuevoPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/admin/clientes" className="text-sm text-indigo-700 hover:underline">
        ← Clientes
      </Link>
      <h1 className="text-xl font-bold text-slate-900">Nuevo cliente</h1>
      <p className="text-sm text-slate-600">Formulario de alta conectado al API en una siguiente fase.</p>
      <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={(e) => e.preventDefault()}>
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Nombre del negocio" />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Contacto" />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Teléfono" />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Email" type="email" />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Dirección / ubicación" />
        <div className="grid grid-cols-2 gap-2">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Zona" />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Día visita" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white">
          Guardar (demo)
        </button>
      </form>
    </div>
  );
}
