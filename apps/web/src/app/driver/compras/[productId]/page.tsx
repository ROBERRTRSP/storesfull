"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { purchaseStatusClass } from "@/components/conductor/badges";
import { useConductor } from "@/components/conductor/conductor-context";
import type { PurchaseLineStatus } from "@/components/conductor/types";

const statuses: PurchaseLineStatus[] = ["pendiente", "comprado", "parcial", "no_encontrado", "sustituido"];

export default function ConductorCompraDetallePage() {
  const params = useParams();
  const productId = params.productId as string;
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    getAggregateRow,
    orders,
    customers,
    updatePurchaseForProduct,
    setProductPurchasedQtyTotal,
    updateOrderLinePurchase,
  } = useConductor();

  const row = getAggregateRow(productId);
  const [qtyTotal, setQtyTotal] = useState(row ? String(row.qtyPurchased) : "0");
  const [supplier, setSupplier] = useState(row?.supplier ?? "");
  const [note, setNote] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [subName, setSubName] = useState("");

  if (!row) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Producto no encontrado en la lista de hoy.</p>
        <Link href="/driver/compras" className="text-indigo-700">
          Volver
        </Link>
      </div>
    );
  }

  const relatedLines = orders.flatMap((o) =>
    o.lines
      .filter((l) => l.productId === productId)
      .map((l) => ({
        orderId: o.id,
        customerId: o.customerId,
        line: l,
      })),
  );

  const customerName = (id: string) => customers.find((c) => c.id === id)?.businessName ?? id;

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = typeof r.result === "string" ? r.result : undefined;
      if (dataUrl) updatePurchaseForProduct(productId, { receiptPhotoDataUrl: dataUrl });
    };
    r.readAsDataURL(f);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/driver/compras" className="text-sm font-medium text-indigo-700">
          ← Lista de compra
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{row.productName}</h1>
        <p className="text-sm text-slate-600">Registro por producto · afecta todos los pedidos vinculados</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Resumen agregado</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${purchaseStatusClass(row.purchaseStatus)}`}>
            {row.purchaseStatus}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">Requerido</dt>
            <dd className="font-bold">{row.qtyRequired}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Comprado</dt>
            <dd className="font-bold">{row.qtyPurchased}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Falta</dt>
            <dd className="font-bold text-amber-800">{row.qtyPending}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Costo est.</dt>
            <dd className="font-bold">${row.costEstimateTotal.toFixed(2)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
        <h2 className="font-semibold text-indigo-950">Registro rápido</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Cantidad total comprada (distribuye a pedidos)</label>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                type="number"
                min={0}
                value={qtyTotal}
                onChange={(e) => setQtyTotal(e.target.value)}
                className="w-28 rounded-lg border border-slate-200 px-2 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setProductPurchasedQtyTotal(productId, Number(qtyTotal) || 0)}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
              >
                Aplicar cantidad
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Estado de compra (todas las líneas del producto)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updatePurchaseForProduct(productId, { purchaseStatus: s })}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-slate-200 ${purchaseStatusClass(s)}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Costo unitario real (opcional, aplica a líneas)</label>
              <input
                type="text"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="ej. 1.85"
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
              />
              <button
                type="button"
                className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
                onClick={() => {
                  const v = parseFloat(unitCost.replace(",", "."));
                  if (!Number.isFinite(v)) return;
                  updatePurchaseForProduct(productId, { unitCostReal: v });
                }}
              >
                Guardar costo
              </button>
            </div>
            <div>
              <label className="text-xs text-slate-600">Proveedor / almacén</label>
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
              />
              <button
                type="button"
                className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
                onClick={() => updatePurchaseForProduct(productId, { supplier })}
              >
                Guardar proveedor
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-600">Nota u observación</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
            />
            <button
              type="button"
              className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              onClick={() => updatePurchaseForProduct(productId, { purchaseNote: note })}
            >
              Guardar nota
            </button>
          </div>
          <div>
            <label className="text-xs text-slate-600">Sustitución (nombre alternativo)</label>
            <input
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
            />
            <button
              type="button"
              className="mt-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-900"
              onClick={() => {
                updatePurchaseForProduct(productId, {
                  purchaseStatus: "sustituido",
                  substitutionProductName: subName,
                });
              }}
            >
              Marcar sustituido
            </button>
          </div>
          <div>
            <label className="text-xs text-slate-600">Foto factura / comprobante</label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-2 w-full rounded-xl border border-dashed border-slate-300 bg-white py-3 text-sm font-medium text-slate-700"
            >
              Tomar o subir foto
            </button>
            {relatedLines[0]?.line.receiptPhotoDataUrl && (
              <p className="mt-2 text-xs text-emerald-700">Comprobante guardado en memoria (demo).</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Pedidos y clientes afectados</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {relatedLines.map(({ orderId, customerId, line }) => (
            <li key={`${orderId}-${line.productName}`} className="py-3 text-sm">
              <p className="font-medium text-slate-900">
                {customerName(customerId)} · pedido {orderId}
              </p>
              <p className="text-xs text-slate-500">
                Pedido {line.qtyOrdered} u · comprado {line.qtyPurchased} ·{" "}
                <span className={purchaseStatusClass(line.purchaseStatus)}>{line.purchaseStatus}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  type="number"
                  min={0}
                  className="w-20 rounded border px-1 py-1 text-xs"
                  defaultValue={line.qtyPurchased}
                  id={`pq-${orderId}`}
                />
                <button
                  type="button"
                  className="rounded bg-slate-100 px-2 py-1 text-xs"
                  onClick={() => {
                    const el = document.getElementById(`pq-${orderId}`) as HTMLInputElement | null;
                    const n = Number(el?.value);
                    if (!Number.isFinite(n)) return;
                    updateOrderLinePurchase(orderId, productId, { qtyPurchased: n });
                  }}
                >
                  Actualizar línea
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
