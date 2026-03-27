import type { DeliveryLineStatus, PaymentMethod, PurchaseLineStatus, RouteVisitStatus } from "./types";

export function purchaseStatusClass(s: PurchaseLineStatus) {
  const map: Record<PurchaseLineStatus, string> = {
    pendiente: "bg-slate-100 text-slate-800",
    comprado: "bg-emerald-100 text-emerald-900",
    parcial: "bg-amber-100 text-amber-950",
    no_encontrado: "bg-rose-100 text-rose-900",
    sustituido: "bg-violet-100 text-violet-900",
  };
  return map[s];
}

export function deliveryStatusClass(s: DeliveryLineStatus) {
  const map: Record<DeliveryLineStatus, string> = {
    pendiente: "bg-slate-100 text-slate-700",
    entregado: "bg-emerald-100 text-emerald-900",
    parcial: "bg-amber-100 text-amber-950",
    no_entregado: "bg-rose-100 text-rose-900",
    sustituido: "bg-violet-100 text-violet-900",
  };
  return map[s];
}

export function routeVisitClass(s: RouteVisitStatus) {
  const map: Record<RouteVisitStatus, string> = {
    pendiente: "bg-slate-100 text-slate-800",
    en_ruta: "bg-sky-100 text-sky-950",
    visitado: "bg-indigo-100 text-indigo-950",
    entregado: "bg-emerald-100 text-emerald-900",
    parcial: "bg-amber-100 text-amber-950",
    no_entregado: "bg-rose-100 text-rose-900",
    reagendado: "bg-orange-100 text-orange-950",
  };
  return map[s];
}

export function paymentMethodLabel(m: PaymentMethod) {
  const map: Record<PaymentMethod, string> = {
    efectivo: "Efectivo",
    zelle: "Zelle",
    transferencia: "Transferencia",
    cash_app: "Cash App",
    credito_pendiente: "Crédito / pendiente",
    otro: "Otro",
  };
  return map[m];
}
