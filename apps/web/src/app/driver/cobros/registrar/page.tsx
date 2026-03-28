"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { paymentMethodLabel } from "@/components/conductor/badges";
import { amountPendingOrder, orderSaleTotal } from "@/components/conductor/aggregate";
import { useConductor } from "@/components/conductor/conductor-context";
import type { PaymentMethod } from "@/components/conductor/types";

const methods: PaymentMethod[] = ["efectivo", "zelle", "transferencia", "cash_app", "credito_pendiente", "otro"];

function ConductorCobroRegistrarInner() {
  const router = useRouter();
  const search = useSearchParams();
  const preCliente = search.get("cliente");
  const { customers, orders, getOrdersForCustomer, applyPayment } = useConductor();

  const [customerId, setCustomerId] = useState(preCliente ?? "");
  useEffect(() => {
    if (preCliente) setCustomerId(preCliente);
  }, [preCliente]);

  const ordersCliente = useMemo(() => (customerId ? getOrdersForCustomer(customerId) : []), [customerId, getOrdersForCustomer]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (customerId && ordersCliente.length) {
      setSelected(ordersCliente.map((o) => o.id));
    }
  }, [customerId, ordersCliente]);

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const pendienteSeleccion = useMemo(() => {
    return ordersCliente.filter((o) => selected.includes(o.id)).reduce((s, o) => s + amountPendingOrder(o), 0);
  }, [ordersCliente, selected]);

  const [amount, setAmount] = useState("");
  const [mA, setMA] = useState<PaymentMethod>("efectivo");
  const [amtA, setAmtA] = useState("");
  const [mB, setMB] = useState<PaymentMethod>("zelle");
  const [amtB, setAmtB] = useState("");
  const [useSplit, setUseSplit] = useState(false);
  const [note, setNote] = useState("");

  const submit = async () => {
    if (!customerId || selected.length === 0) return;
    const total = parseFloat(amount.replace(",", "."));
    if (!Number.isFinite(total) || total <= 0) return;

    let splits: { method: PaymentMethod; amount: number }[];
    if (useSplit) {
      const a = parseFloat(amtA.replace(",", ".")) || 0;
      const b = parseFloat(amtB.replace(",", ".")) || 0;
      if (Math.abs(a + b - total) > 0.05) {
        alert("La suma de métodos debe igualar el monto total.");
        return;
      }
      splits = [
        { method: mA, amount: a },
        { method: mB, amount: b },
      ].filter((x) => x.amount > 0);
    } else {
      splits = [{ method: mA, amount: total }];
    }

    const id = await applyPayment({ customerId, orderIds: selected, amount: total, splits, note: note || undefined });
    if (id) router.push(`/driver/recibos?pago=${id}`);
    else alert("Revisa montos y pedidos seleccionados.");
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/driver/cobros" className="text-sm font-medium text-indigo-700">
          ← Cobros
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">Registrar cobro</h1>
        <p className="text-sm text-slate-600">Uno o varios pedidos del mismo cliente · parcial o completo</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-xs font-semibold text-slate-500">Cliente</label>
        <select
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setSelected([]);
          }}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-base"
        >
          <option value="">Seleccionar…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.businessName}
            </option>
          ))}
        </select>
      </section>

      {customerId && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Pedidos a incluir</h2>
          <p className="text-xs text-slate-500">Pendiente total seleccionado: ${pendienteSeleccion.toFixed(2)}</p>
          <ul className="mt-3 space-y-2">
            {ordersCliente.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(o.id)}
                    onChange={() => toggle(o.id)}
                    className="h-5 w-5 rounded border-slate-300"
                  />
                  <div className="text-sm">
                    <p className="font-mono text-xs text-slate-500">{o.id}</p>
                    <p className="font-medium">Total ${orderSaleTotal(o).toFixed(2)}</p>
                    <p className="text-xs text-amber-800">Pendiente ${amountPendingOrder(o).toFixed(2)}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
        <h2 className="font-semibold text-emerald-950">Monto y método</h2>
        <label className="mt-3 block text-xs text-slate-600">Monto a registrar</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder={`Máx sugerido ${pendienteSeleccion.toFixed(2)}`}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-lg font-bold"
        />
        <button
          type="button"
          className="mt-2 text-xs font-medium text-emerald-800 underline"
          onClick={() => setAmount(pendienteSeleccion.toFixed(2))}
        >
          Usar todo el pendiente seleccionado
        </button>

        <div className="mt-4 flex items-center gap-2">
          <input type="checkbox" id="split" checked={useSplit} onChange={(e) => setUseSplit(e.target.checked)} />
          <label htmlFor="split" className="text-sm">
            Pago mixto (dos métodos)
          </label>
        </div>

        {!useSplit ? (
          <div className="mt-3">
            <label className="text-xs text-slate-600">Método</label>
            <select value={mA} onChange={(e) => setMA(e.target.value as PaymentMethod)} className="mt-1 w-full rounded-xl border px-3 py-2">
              {methods.map((m) => (
                <option key={m} value={m}>
                  {paymentMethodLabel(m)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs">Método 1</label>
              <select value={mA} onChange={(e) => setMA(e.target.value as PaymentMethod)} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm">
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {paymentMethodLabel(m)}
                  </option>
                ))}
              </select>
              <input
                value={amtA}
                onChange={(e) => setAmtA(e.target.value)}
                placeholder="Monto"
                className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs">Método 2</label>
              <select value={mB} onChange={(e) => setMB(e.target.value as PaymentMethod)} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm">
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {paymentMethodLabel(m)}
                  </option>
                ))}
              </select>
              <input
                value={amtB}
                onChange={(e) => setAmtB(e.target.value)}
                placeholder="Monto"
                className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <label className="mt-4 block text-xs text-slate-600">Nota (opcional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />

        <button
          type="button"
          onClick={submit}
          className="mt-4 w-full rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white"
        >
          Guardar cobro y ver recibo
        </button>
      </section>
    </div>
  );
}

export default function ConductorCobroRegistrarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Cargando formulario…</div>
      }
    >
      <ConductorCobroRegistrarInner />
    </Suspense>
  );
}
