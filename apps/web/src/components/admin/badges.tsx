import type { AdminOrderStatus, AlertSeverity, AlertState } from "./types";

export function OrderStatusBadge({ status }: { status: AdminOrderStatus }) {
  const map: Record<AdminOrderStatus, string> = {
    borrador: "bg-slate-100 text-slate-800",
    confirmado: "bg-blue-100 text-blue-900",
    cerrado_edicion: "bg-slate-200 text-slate-800",
    pendiente_compra: "bg-amber-100 text-amber-950",
    en_compra: "bg-orange-100 text-orange-950",
    comprado: "bg-cyan-100 text-cyan-950",
    en_ruta: "bg-violet-100 text-violet-950",
    entregado: "bg-emerald-100 text-emerald-950",
    parcial: "bg-yellow-100 text-yellow-950",
    cancelado: "bg-red-100 text-red-900",
    pendiente_pago: "bg-rose-100 text-rose-950",
    pagado: "bg-green-100 text-green-950",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status]}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function AlertSeverityBadge({ s }: { s: AlertSeverity }) {
  const cls =
    s === "critica"
      ? "bg-red-600 text-white"
      : s === "alta"
        ? "bg-orange-500 text-white"
        : s === "media"
          ? "bg-amber-400 text-amber-950"
          : "bg-slate-200 text-slate-800";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{s}</span>;
}

export function AlertStateBadge({ s }: { s: AlertState }) {
  const cls =
    s === "pendiente" ? "bg-amber-100 text-amber-950" : s === "revisado" ? "bg-blue-100 text-blue-900" : "bg-emerald-100 text-emerald-900";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{s}</span>;
}
