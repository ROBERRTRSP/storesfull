"use client";

import Link from "next/link";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/compras", label: "Compras" },
  { href: "/admin/entregas", label: "Entregas / rutas" },
  { href: "/admin/pagos", label: "Pagos / cobros" },
  { href: "/admin/balances", label: "Cuentas por cobrar" },
  { href: "/admin/gastos", label: "Gastos" },
  { href: "/admin/contabilidad", label: "Contabilidad" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/configuracion", label: "Configuración" },
  { href: "/admin/auditoria", label: "Auditoría" },
  { href: "/admin/alertas", label: "Alertas" },
];

export default function AdminMenuPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Todos los módulos</h1>
        <p className="text-sm text-slate-600">Acceso rápido en móvil</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/50">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
