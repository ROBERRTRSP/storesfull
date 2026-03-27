"use client";

import { useMemo, useState } from "react";
import { useClientData } from "@/components/cliente/client-context";

export default function CatalogoPage() {
  const { products, addToCart } = useClientData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const filtered = products.filter((p) => {
    const okCategory = category === "all" || p.category === category;
    const q = search.trim().toLowerCase();
    const okSearch = !q || p.name.toLowerCase().includes(q);
    return okCategory && okSearch;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Catalogo</h1>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto"
          className="rounded-lg border bg-white px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border bg-white px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Todas las categorias" : c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => addToCart(p.id, 1)}
            className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:scale-[0.99]"
          >
            <p className="font-medium text-slate-900">{p.name}</p>
            <p className="text-sm text-slate-500">${p.price.toFixed(2)} / {p.unit}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.promo && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">{p.promo}</span>}
              {p.combo && <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">{p.combo}</span>}
            </div>
            <span className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-center text-sm text-white">
              Agregar
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

