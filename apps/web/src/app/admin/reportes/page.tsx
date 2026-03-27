"use client";

const reportList = [
  "Ventas por día / semana / mes",
  "Ventas por cliente, vendedor, ruta, producto",
  "Productos más vendidos · clientes que más compran",
  "Clientes inactivos · clientes con deuda",
  "Compras por proveedor",
  "Gastos por período",
  "Ganancias por período",
  "Pedidos por estado",
  "Pagos recibidos",
  "Cuentas por cobrar",
];

export default function AdminReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reportes</h1>
        <p className="text-sm text-slate-600">Filtros, vista previa y exportación</p>
      </div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm text-slate-600">
          Desde
          <input type="date" className="ml-2 rounded-lg border px-2 py-1 text-sm" defaultValue="2026-03-01" />
        </label>
        <label className="text-sm text-slate-600">
          Hasta
          <input type="date" className="ml-2 rounded-lg border px-2 py-1 text-sm" defaultValue="2026-03-27" />
        </label>
        <select className="rounded-lg border px-2 py-1 text-sm">
          <option>Ventas por día</option>
          <option>Ventas por vendedor</option>
          <option>Cuentas por cobrar</option>
        </select>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {reportList.map((r) => (
          <li key={r} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span>{r}</span>
            <span className="flex gap-1">
              <button type="button" className="rounded border px-2 py-1 text-xs">
                PDF
              </button>
              <button type="button" className="rounded border px-2 py-1 text-xs">
                Excel
              </button>
              <button type="button" className="rounded border px-2 py-1 text-xs">
                CSV
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
