"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSeller } from "@/components/vendedor/seller-context";
import type { SellerOrderLine } from "@/components/vendedor/types";

export default function VendedorNuevoPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getCustomer,
    catalog,
    getFrequentProductsForCustomer,
    getDraftForCustomer,
    offers,
    createOrUpdateDraft,
    confirmOrder,
  } = useSeller();

  const c = getCustomer(id);
  const draft = getDraftForCustomer(id);
  const frequentNames = getFrequentProductsForCustomer(id).map((x) => x.name);
  const [lines, setLines] = useState<SellerOrderLine[]>(() => draft?.lines ?? []);
  const [note, setNote] = useState(draft?.note ?? "");
  const [q, setQ] = useState("");

  const productsFiltered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return catalog;
    return catalog.filter((p) => p.name.toLowerCase().includes(qq) || p.tags.some((t) => t.includes(qq)));
  }, [catalog, q]);

  if (!c) {
    return <p className="text-sm text-slate-600">Cliente no encontrado.</p>;
  }

  const addProduct = (productId: string) => {
    const p = catalog.find((x) => x.id === productId);
    if (!p) return;
    const existing = lines.find((l) => l.productId === productId);
    if (existing) {
      setLines(lines.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l)));
    } else {
      setLines([...lines, { productId: p.id, name: p.name, qty: 1, unitPrice: p.price }]);
    }
  };

  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setLines(lines.filter((l) => l.productId !== productId));
      return;
    }
    setLines(lines.map((l) => (l.productId === productId ? { ...l, qty } : l)));
  };

  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

  const saveDraft = async () => {
    const row = await createOrUpdateDraft(id, lines, note);
    if (row) router.push(`/vendedor/pedidos/${row.id}`);
  };

  const confirm = async () => {
    const row = await createOrUpdateDraft(id, lines, note);
    if (!row) return;
    await confirmOrder(row.id);
    router.push(`/vendedor/clientes/${id}`);
  };

  const frequentProducts = catalog.filter((p) => frequentNames.includes(p.name));
  const offerProducts = catalog.filter((p) => p.isOffer);

  return (
    <div className="space-y-4 pb-8">
      <div>
        <Link href={`/vendedor/clientes/${id}`} className="text-sm text-emerald-700">
          Volver al cliente
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">Pedido · {c.businessName}</h1>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar producto..."
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
      />

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3">
        <h2 className="text-sm font-semibold text-emerald-900">Frecuentes del cliente</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {frequentProducts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addProduct(p.id)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-900 shadow-sm"
            >
              + {p.name}
            </button>
          ))}
          {frequentProducts.length === 0 && <p className="text-xs text-emerald-800/80">Sin datos aun.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3">
        <h2 className="text-sm font-semibold text-amber-950">Ofertas / destacados</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {offerProducts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addProduct(p.id)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-amber-950 shadow-sm"
            >
              + {p.name} · ${p.price.toFixed(2)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-amber-900/80">
          {offers.slice(0, 2).map((o) => o.title).join(" · ")}
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Catalogo</h2>
        <ul className="space-y-2">
          {productsFiltered.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
              <div>
                <p className="font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">
                  ${p.price.toFixed(2)} / {p.unit}
                </p>
              </div>
              <button type="button" onClick={() => addProduct(p.id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white">
                Agregar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Carrito</h2>
        {lines.length === 0 && <p className="mt-2 text-sm text-slate-500">Vacío — agrega productos.</p>}
        <ul className="mt-2 space-y-2">
          {lines.map((l) => (
            <li key={l.productId} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-slate-800">{l.name}</span>
              <div className="flex items-center gap-2">
                <button type="button" className="rounded border px-2 py-0.5" onClick={() => setQty(l.productId, l.qty - 1)}>
                  -
                </button>
                <span className="w-6 text-center">{l.qty}</span>
                <button type="button" className="rounded border px-2 py-0.5" onClick={() => setQty(l.productId, l.qty + 1)}>
                  +
                </button>
                <span className="w-20 text-right text-slate-600">${(l.qty * l.unitPrice).toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right font-semibold text-slate-900">Total ${total.toFixed(2)}</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notas del pedido (visible operacion)"
          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={saveDraft} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
            Guardar borrador
          </button>
          <button type="button" onClick={confirm} disabled={lines.length === 0} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            Confirmar pedido
          </button>
        </div>
      </section>
    </div>
  );
}
