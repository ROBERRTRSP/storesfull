"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSeller } from "@/components/vendedor/seller-context";
import type { SellerOrderLine } from "@/components/vendedor/types";

export default function VendedorEditarPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, catalog, getCustomer, createOrUpdateDraft, confirmOrder } = useSeller();
  const order = orders.find((o) => o.id === id);

  const [lines, setLines] = useState<SellerOrderLine[]>(() => order?.lines ?? []);
  const [note, setNote] = useState(order?.note ?? "");

  const c = order ? getCustomer(order.customerId) : undefined;

  const total = useMemo(() => lines.reduce((s, l) => s + l.qty * l.unitPrice, 0), [lines]);

  if (!order || !c) {
    return (
      <p className="text-sm text-slate-600">
        Pedido no encontrado.{" "}
        <Link href="/vendedor/clientes" className="text-emerald-700">
          Volver
        </Link>
      </p>
    );
  }

  if (order.status !== "borrador") {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm">Este pedido ya no es borrador ({order.status}).</p>
        <Link href={`/vendedor/clientes/${order.customerId}`} className="text-emerald-700">
          Volver al cliente
        </Link>
      </div>
    );
  }

  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setLines(lines.filter((l) => l.productId !== productId));
      return;
    }
    setLines(lines.map((l) => (l.productId === productId ? { ...l, qty } : l)));
  };

  const addProduct = (productId: string) => {
    const p = catalog.find((x) => x.id === productId);
    if (!p) return;
    const existing = lines.find((l) => l.productId === productId);
    if (existing) setLines(lines.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l)));
    else setLines([...lines, { productId: p.id, name: p.name, qty: 1, unitPrice: p.price }]);
  };

  const save = () => {
    createOrUpdateDraft(order.customerId, lines, note);
    router.push(`/vendedor/clientes/${order.customerId}`);
  };

  const confirm = () => {
    createOrUpdateDraft(order.customerId, lines, note);
    confirmOrder(order.id);
    router.push(`/vendedor/clientes/${order.customerId}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/vendedor/clientes/${order.customerId}`} className="text-sm text-emerald-700">
          Volver
        </Link>
        <h1 className="mt-2 text-xl font-bold">Editar borrador · {c.businessName}</h1>
        <p className="text-sm text-slate-500">#{order.id}</p>
      </div>

      <ul className="space-y-2">
        {lines.map((l) => (
          <li key={l.productId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <span>{l.name}</span>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded border px-2" onClick={() => setQty(l.productId, l.qty - 1)}>
                -
              </button>
              <span>{l.qty}</span>
              <button type="button" className="rounded border px-2" onClick={() => setQty(l.productId, l.qty + 1)}>
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-right font-semibold">Total ${total.toFixed(2)}</p>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-600">Agregar producto</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {catalog.map((p) => (
            <button key={p.id} type="button" className="rounded border bg-white px-2 py-1 text-xs" onClick={() => addProduct(p.id)}>
              + {p.name}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
        placeholder="Notas"
      />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} className="rounded-xl border px-4 py-2 text-sm font-medium">
          Guardar borrador
        </button>
        <button type="button" onClick={confirm} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Confirmar
        </button>
      </div>
    </div>
  );
}
