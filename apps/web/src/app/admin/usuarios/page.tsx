"use client";

import { useAdmin } from "@/components/admin/admin-context";

export default function AdminUsuariosPage() {
  const { users } = useAdmin();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Usuarios y roles</h1>
          <p className="text-sm text-slate-600">Administrador, vendedor, delivery, cliente</p>
        </div>
        <button type="button" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          + Nuevo usuario (demo)
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">{u.role}</span>
                </td>
                <td className="px-3 py-2">{u.active ? "Activo" : "Inactivo"}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="text-indigo-700">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-600">
        Asignación de clientes a vendedores y rutas: desde ficha de cliente o módulo de configuración.
      </p>
    </div>
  );
}
