"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { ProductImageThumb } from "@/components/admin/product-image-thumb";
import type { AdminProduct } from "@/components/admin/types";

export default function AdminProductosPage() {
  const { products } = useAdmin();
  const [q, setQ] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("todos");

  const departments = useMemo(() => {
    const s = new Set(products.map((p) => p.department));
    return Array.from(s).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let list = products;
    if (qq) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(qq) ||
          p.sku.toLowerCase().includes(qq) ||
          p.category.toLowerCase().includes(qq) ||
          p.department.toLowerCase().includes(qq),
      );
    }
    if (deptFilter !== "todos") {
      list = list.filter((p) => p.department === deptFilter);
    }
    return list;
  }, [products, q, deptFilter]);

  const byDepartment = useMemo(() => {
    const map = new Map<string, AdminProduct[]>();
    for (const p of filtered) {
      const arr = map.get(p.department) ?? [];
      arr.push(p);
      map.set(p.department, arr);
    }
    const ordered = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "es"));
    for (const [, arr] of ordered) {
      arr.sort((x, y) => x.name.localeCompare(y.name, "es"));
    }
    return ordered;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-600">Catálogo por departamento, precios y rotación</p>
        </div>
        <Link href="/admin/productos/nuevo" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          + Nuevo producto
        </Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar nombre, SKU, categoría o departamento..."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setDeptFilter("todos")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${deptFilter === "todos" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white"}`}
        >
          Todos los departamentos
        </button>
        {departments.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDeptFilter(d)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${deptFilter === d ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {byDepartment.map(([department, rows]) => (
          <section key={department} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">{department}</h2>
              <p className="text-xs text-slate-500">{rows.length} producto{rows.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-white text-xs uppercase text-slate-500">
                  <tr>
                    <th className="w-14 px-2 py-2">Foto</th>
                    <th className="px-3 py-2">Producto</th>
                    <th className="hidden px-3 py-2 md:table-cell">SKU</th>
                    <th className="px-3 py-2">P. venta</th>
                    <th className="hidden px-3 py-2 lg:table-cell">Margen est.</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((p) => {
                    const margin = p.salePrice - p.refCost;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="px-2 py-2 align-middle">
                          <ProductImageThumb src={p.imageUrl} alt={p.name} size={44} />
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.category}</p>
                        </td>
                        <td className="hidden px-3 py-2 font-mono text-xs md:table-cell">{p.sku}</td>
                        <td className="px-3 py-2 font-medium">${p.salePrice.toFixed(2)}</td>
                        <td className="hidden px-3 py-2 text-slate-600 lg:table-cell">${margin.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <span className={p.active ? "text-emerald-700" : "text-slate-400"}>{p.active ? "Activo" : "Inactivo"}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link href={`/admin/productos/nuevo?id=${p.id}`} className="text-indigo-700 hover:underline">
                            Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-600">
          Ningún producto coincide con la búsqueda o el departamento seleccionado.
        </p>
      )}
    </div>
  );
}
