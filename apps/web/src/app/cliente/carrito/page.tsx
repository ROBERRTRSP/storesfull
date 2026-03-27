"use client";

import { useState } from "react";
import { useClientData } from "@/components/cliente/client-context";

export default function CarritoPage() {
  const { cart, products, updateCartQty, removeFromCart, cartTotal, saveDraft, confirmOrder } = useClientData();
  const [note, setNote] = useState("");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Carrito</h1>
      <div className="space-y-2">
        {cart.length === 0 && <p className="rounded-lg border bg-white p-3 text-sm text-slate-500">Tu carrito esta vacio.</p>}
        {cart.map((it) => {
          const p = products.find((x) => x.id === it.productId);
          if (!p) return null;
          return (
            <div key={it.productId} className="rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-slate-500">${p.price.toFixed(2)} / {p.unit}</p>
                </div>
                <button onClick={() => removeFromCart(it.productId)} className="rounded border px-2 py-1 text-xs">
                  Quitar
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => updateCartQty(it.productId, it.qty - 1)} className="rounded border px-2">-</button>
                <span className="min-w-8 text-center text-sm">{it.qty}</span>
                <button onClick={() => updateCartQty(it.productId, it.qty + 1)} className="rounded border px-2">+</button>
              </div>
            </div>
          );
        })}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota del pedido (opcional)"
        className="min-h-24 w-full rounded-lg border bg-white p-3 text-sm"
      />
      <div className="rounded-xl border bg-white p-4">
        <p className="text-sm text-slate-500">Total</p>
        <p className="text-2xl font-bold">${cartTotal.toFixed(2)}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button onClick={() => saveDraft(note)} className="rounded-lg border px-3 py-2 text-sm">
            Guardar borrador
          </button>
          <button onClick={() => confirmOrder(note)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
            Confirmar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

