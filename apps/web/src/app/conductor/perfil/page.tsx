"use client";

import { useConductor } from "@/components/conductor/conductor-context";

export default function ConductorPerfilPage() {
  const { profile, logout } = useConductor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Perfil</h1>
        <p className="text-sm text-slate-600">Conductor / comprador</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Nombre</dt>
            <dd className="font-medium">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Email</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Teléfono</dt>
            <dd className="font-medium">{profile.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Vehículo / ruta</dt>
            <dd className="font-medium">{profile.vehicleLabel}</dd>
          </div>
        </dl>
      </section>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Permisos de este rol</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>Compra, entrega y cobro operativos</li>
          <li>Sin edición de precios de catálogo ni administración global</li>
          <li>Sin contabilidad completa del negocio</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-900"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
