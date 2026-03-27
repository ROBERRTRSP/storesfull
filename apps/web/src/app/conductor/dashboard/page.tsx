"use client";

import Link from "next/link";
import { useConductor } from "@/components/conductor/conductor-context";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm sm:px-3 sm:py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-[11px]">{label}</p>
      <p className="mt-0.5 text-base font-bold leading-tight text-slate-900 sm:text-lg">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

export default function ConductorDashboardPage() {
  const { dashboardStats, today, jornadaCerrada, finalJornadaNote } = useConductor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hoy · {today}</h1>
        <p className="text-sm text-slate-600">Compra, ruta, entrega y cobro — vista operativa</p>
      </div>

      {jornadaCerrada && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Jornada cerrada</p>
          {finalJornadaNote && <p className="mt-1 text-amber-900/90">{finalJornadaNote}</p>}
          <p className="mt-2 text-xs text-amber-800/80">Puedes revisar el historial de cierres en Historial.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Pedidos hoy" value={dashboardStats.pedidosHoy} />
        <Stat label="Clientes en ruta" value={dashboardStats.clientesRuta} />
        <Stat label="Compra pendiente" value={dashboardStats.productosCompraPendiente} hint="SKU" />
        <Stat label="Compra lista" value={dashboardStats.productosCompraListos} hint="SKU" />
        <Stat label="Entregas OK" value={dashboardStats.entregasCompletas} />
        <Stat label="Entregas parciales" value={dashboardStats.entregasParciales} />
        <Stat label="No entregados" value={dashboardStats.entregasNoCompletas} />
        <Stat label="Cobrado hoy" value={`$${dashboardStats.totalCobrado.toFixed(2)}`} />
        <Stat label="Pendiente cobro" value={`$${dashboardStats.totalPendienteCobro.toFixed(2)}`} />
        <Stat label="Incidencias" value={dashboardStats.incidenciasHoy} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/conductor/compras"
          className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700"
        >
          Lista de compra
        </Link>
        <Link
          href="/conductor/compras/vinculados"
          className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800"
        >
          Pedidos vinculados
        </Link>
        <Link href="/conductor/compras/en-vivo" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Compra en vivo
        </Link>
        <Link href="/conductor/ruta" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Ruta del día
        </Link>
        <Link href="/conductor/cobros/registrar" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Registrar cobro
        </Link>
        <Link href="/conductor/resumen" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Resumen / cierre
        </Link>
        <Link href="/conductor/incidencias" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
          Incidencia
        </Link>
      </div>
    </div>
  );
}
