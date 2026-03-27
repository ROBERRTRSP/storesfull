"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useConductor } from "@/components/conductor/conductor-context";

function receiptBody(cName: string, rec: { totalSale: number; amountPaid: number; amountPending: number; methodsLabel: string; orderIds: string[] }) {
  return [
    `Recibo · ${cName}`,
    `Pedidos: ${rec.orderIds.join(", ")}`,
    `Total venta: $${rec.totalSale.toFixed(2)}`,
    `Cobrado: $${rec.amountPaid.toFixed(2)}`,
    `Pendiente: $${rec.amountPending.toFixed(2)}`,
    `Métodos: ${rec.methodsLabel}`,
  ].join("\n");
}

function ConductorRecibosInner() {
  const search = useSearchParams();
  const payId = search.get("pago");
  const { payments, receipts, customers, generateReceiptForPayment, profile } = useConductor();
  const [highlight, setHighlight] = useState<string | null>(payId);
  const lastGen = useRef<string | null>(null);

  useEffect(() => {
    if (!payId) return;
    if (lastGen.current === payId) return;
    lastGen.current = payId;
    generateReceiptForPayment(payId);
    setHighlight(payId);
  }, [payId, generateReceiptForPayment]);

  const list = [...receipts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const name = (id: string) => customers.find((c) => c.id === id)?.businessName ?? id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Recibos</h1>
        <p className="text-sm text-slate-600">Vista previa · WhatsApp · email</p>
      </div>

      <ul className="space-y-4">
        {list.length === 0 && <p className="text-sm text-slate-500">Aún no hay recibos generados. Registra un cobro primero.</p>}
        {list.map((r) => {
          const pay = payments.find((p) => p.id === r.paymentId);
          const cName = name(r.customerId);
          const body = encodeURIComponent(receiptBody(cName, r));
          const wa = `https://wa.me/?text=${body}`;
          const mail = `mailto:?subject=${encodeURIComponent(`Recibo ${r.id}`)}&body=${body}`;
          const isNew = r.paymentId === highlight;
          return (
            <li
              key={r.id}
              className={`rounded-2xl border p-4 shadow-sm ${isNew ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 bg-white"}`}
            >
              <p className="font-mono text-xs text-slate-500">{r.id}</p>
              <p className="text-lg font-bold text-slate-900">{cName}</p>
              <p className="text-xs text-slate-500">{r.createdAt}</p>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                {receiptBody(cName, r)}
                {r.summaryLines.length > 0 && (
                  <>
                    {"\n---\n"}
                    {r.summaryLines.map((l) => `${l.productName} x${l.qty}  $${l.subtotal.toFixed(2)}`).join("\n")}
                  </>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={wa} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                  WhatsApp
                </a>
                <a href={mail} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold">
                  Email
                </a>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                >
                  Imprimir / PDF
                </button>
              </div>
              {pay && <p className="mt-2 text-[10px] text-slate-400">Registrado por {pay.recordedBy ?? profile.name}</p>}
            </li>
          );
        })}
      </ul>

      <Link href="/conductor/cobros/registrar" className="block text-center text-sm font-medium text-indigo-700">
        + Nuevo cobro / recibo
      </Link>
    </div>
  );
}

export default function ConductorRecibosPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Cargando recibos…</div>}>
      <ConductorRecibosInner />
    </Suspense>
  );
}
