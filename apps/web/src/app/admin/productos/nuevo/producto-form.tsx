"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { DEPARTMENT_OTHER, SUGGESTED_PRODUCT_DEPARTMENTS } from "@/components/admin/product-departments";

const PLACEHOLDER = "/images/product-placeholder.svg";

export function AdminProductoForm() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const isEdit = Boolean(id);
  const { products } = useAdmin();

  const editing = useMemo(() => (id ? products.find((p) => p.id === id) : undefined), [id, products]);

  const departmentOptions = useMemo(() => {
    const fromCatalog = Array.from(new Set(products.map((p) => p.department)));
    const merged = new Set<string>([...SUGGESTED_PRODUCT_DEPARTMENTS, ...fromCatalog, DEPARTMENT_OTHER]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  const defaultDept = isEdit && editing ? editing.department : "";
  const [department, setDepartment] = useState(defaultDept);
  const [otherDepartment, setOtherDepartment] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    setPhotoPreview(editing?.imageUrl ?? null);
  }, [editing?.imageUrl, editing?.id]);

  useEffect(() => {
    if (isEdit && editing) {
      setDepartment(editing.department);
    }
  }, [isEdit, editing]);

  const onPickFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  }, []);

  const [imageUrlInput, setImageUrlInput] = useState("");
  const applyImageUrl = useCallback(() => {
    const u = imageUrlInput.trim();
    if (!u) return;
    setPhotoPreview(u);
  }, [imageUrlInput]);

  const previewSrc = photoPreview || PLACEHOLDER;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/admin/productos" className="text-sm text-indigo-700 hover:underline">
        ← Productos
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{isEdit ? "Editar producto" : "Nuevo producto"}</h1>
      <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium text-slate-600">Foto del producto</p>
          <div className="relative h-36 w-36 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* next/image no acepta data: ni URLs arbitrarias sin configurar; preview demo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="Vista previa del producto" className="h-full w-full object-cover" />
          </div>
          <label className="w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-700 hover:bg-slate-50">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={onPickFile} />
            Elegir archivo…
          </label>
          <div className="flex w-full gap-2">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="O pegar URL de imagen (https://…)"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button type="button" onClick={applyImageUrl} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
              Usar URL
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-500">En producción la foto se sube al servidor; aquí solo vista previa local (demo).</p>
        </div>

        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Nombre" defaultValue={editing?.name ?? ""} />

        <div>
          <label htmlFor="product-dept" className="mb-1 block text-xs font-medium text-slate-600">
            Departamento
          </label>
          <select
            id="product-dept"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
            required
          >
            <option value="" disabled>
              Seleccionar departamento
            </option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {department === DEPARTMENT_OTHER && (
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Escribir departamento"
              value={otherDepartment}
              onChange={(e) => setOtherDepartment(e.target.value)}
              required
              aria-label="Nombre del departamento personalizado"
            />
          )}
        </div>

        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Categoría / línea (ej. Granos)"
          defaultValue={editing?.category ?? ""}
        />
        <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Descripción" rows={3} />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="SKU" defaultValue={editing?.sku ?? ""} />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Unidad de venta" defaultValue={editing?.unit ?? ""} />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Precio venta"
            type="number"
            step="0.01"
            defaultValue={editing?.salePrice ?? ""}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Costo ref. compra"
            type="number"
            step="0.01"
            defaultValue={editing?.refCost ?? ""}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={editing?.active !== false} className="rounded border-slate-300" />
          Activo en catálogo
        </label>
        <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white">
          Guardar (demo)
        </button>
      </form>
    </div>
  );
}
