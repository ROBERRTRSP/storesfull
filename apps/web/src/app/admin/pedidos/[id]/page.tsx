"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { OrderStatusBadge } from "@/components/admin/badges";
import type { AdminOrderStatus } from "@/components/admin/types";
import { parseApiErrorMessage } from "@/lib/api";

type Line = {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

type Detail = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  createdBy: string;
  sellerName: string;
  date: string;
  total: number;
  status: AdminOrderStatus;
  notes: string | null;
  items: Line[];
};

const allStatuses: AdminOrderStatus[] = [
  "borrador",
  "confirmado",
  "cerrado_edicion",
  "pendiente_compra",
  "en_compra",
  "comprado",
  "en_ruta",
  "entregado",
  "parcial",
  "cancelado",
  "pendiente_pago",
  "pagado",
];

export default function AdminPedidoDetallePage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { staffFetch, refreshOperational, getOrder } = useAdmin();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("efectivo");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await staffFetch(`/staff/orders/${id}`, { method: "GET" });
      if (!res.ok) {
        setLoadError(await parseApiErrorMessage(res));
        setDetail(null);
        return;
      }
      setDetail((await res.json()) as Detail);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Error de red");
      setDetail(null);
    }
  }, [staffFetch, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const listRow = getOrder(id);

  const applyStatus = async (status: AdminOrderStatus) => {
    setBusy(true);
    setActionMsg(null);
    try {
      const res = await staffFetch(`/staff/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setActionMsg(await parseApiErrorMessage(res));
        return;
      }
      await refreshOperational();
      await load();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const registerPayment = async () => {
    const amount = Number(payAmount);
    if (!(amount > 0)) {
      setActionMsg("Indica un monto válido");
      return;
    }
    setBusy(true);
    setActionMsg(null);
    try {
      const res = await staffFetch(`/staff/payments`, {
        method: "POST",
        body: JSON.stringify({ orderId: id, amount, method: payMethod }),
      });
      if (!res.ok) {
        setActionMsg(await parseApiErrorMessage(res));
        return;
      }
      setPayAmount("");
      await refreshOperational();
      await load();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  if (loadError && !detail && !listRow) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center">
        <p className="text-slate-600">{loadError}</p>
        <Link href="/admin/pedidos" className="mt-2 inline-block text-indigo-700">
          Volver
        </Link>
      </div>
    );
  }

  const o = detail
    ? detail
    : listRow
      ? {
          ...listRow,
          notes: null,
          items: [] as Line[],
        }
      : null;

  if (!o) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center">
        <p className="text-slate-600">Pedido no encontrado.</p>
        <Link href="/admin/pedidos" className="mt-2 inline-block text-indigo-700">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pedidos" className="text-sm text-indigo-700 hover:underline">
          ← Pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">Pedido #{o.number}</h1>
          <OrderStatusBadge status={o.status} />
        </div>
        <p className="text-sm text-slate-600">
          {o.customerName} · {o.date} · Registrado por {o.createdBy}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Vendedor / origen</p>
          <p className="mt-1 font-semibold">{o.sellerName}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Cliente (ID)</p>
          <p className="mt-1 font-mono text-xs">{o.customerId}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Total</p>
          <p className="mt-1 text-lg font-bold">${o.total.toFixed(2)}</p>
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Líneas del pedido</h2>
        {detail && detail.items.length > 0 ? (
          <ul className="mt-3 divide-y text-sm">
            {detail.items.map((it) => (
              <li key={it.productId} className="flex justify-between py-2">
                <span>
                  {it.productName} × {it.qty}
                </span>
                <span>${it.lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            {detail ? "Sin líneas." : "Cargando líneas…"}
          </p>
        )}
        {o.notes ? (
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-medium">Nota:</span> {o.notes}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
        <h2 className="font-semibold text-indigo-950">Estado del pedido</h2>
        <p className="mt-1 text-sm text-indigo-950/80">
          Las transiciones siguen reglas por rol en servidor. Como administrador puedes forzar el estado operativo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            disabled={busy}
            value={o.status}
            onChange={(e) => void applyStatus(e.target.value as AdminOrderStatus)}
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Registrar cobro</h2>
        <p className="mt-1 text-sm text-slate-600">
          Se guarda en base de datos y, si el monto cubre el total, el pedido pasa a pagado.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs text-slate-500">Monto</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="mt-1 w-32 rounded-lg border px-2 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Método</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="mt-1 rounded-lg border px-2 py-2 text-sm"
            >
              <option value="efectivo">Efectivo</option>
              <option value="zelle">Zelle</option>
              <option value="transferencia">Transferencia</option>
              <option value="credito">Crédito</option>
            </select>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void registerPayment()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Registrar cobro
          </button>
        </div>
      </section>

      {actionMsg ? <p className="text-sm text-rose-600">{actionMsg}</p> : null}
    </div>
  );
}
