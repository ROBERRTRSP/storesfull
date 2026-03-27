"use client";

export default function AdminConfiguracionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-600">Parámetros generales del negocio y del sistema</p>
      </div>
      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-800">Empresa</legend>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Razón social" defaultValue="Ruta Mayorista Demo" />
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="RIF / ID fiscal" />
          <textarea className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Dirección y datos para recibos" rows={2} />
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-800">Catálogos</legend>
          <p className="text-xs text-slate-500">Métodos de pago, estados de pedido, categorías, rutas, zonas, días de visita.</p>
          <button type="button" className="rounded-lg border px-3 py-2 text-sm">
            Gestionar listas (demo)
          </button>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-800">Crédito y reportes</legend>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Límite de crédito por defecto" type="number" />
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Días de crédito por defecto" type="number" />
        </fieldset>
        <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white">
          Guardar cambios (demo)
        </button>
      </form>
    </div>
  );
}
