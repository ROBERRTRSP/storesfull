import { OrderStatus } from "./types";

const map: Record<OrderStatus, string> = {
  borrador: "bg-slate-100 text-slate-700",
  confirmado: "bg-blue-100 text-blue-700",
  pendiente_de_compra: "bg-amber-100 text-amber-700",
  en_compra: "bg-purple-100 text-purple-700",
  comprado: "bg-cyan-100 text-cyan-800",
  en_ruta: "bg-indigo-100 text-indigo-700",
  entregado: "bg-emerald-100 text-emerald-700",
  parcial: "bg-orange-100 text-orange-700",
  cancelado: "bg-rose-100 text-rose-700",
  pendiente_de_pago: "bg-yellow-100 text-yellow-800",
  pagado: "bg-green-100 text-green-800",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[status]}`}>{status.replaceAll("_", " ")}</span>;
}

