import type { OrderStatus } from "@prisma/client";

/** Estados en UI admin / staff (alineados con `AdminOrderStatus`). */
export type StaffOrderUiStatus =
  | "borrador"
  | "confirmado"
  | "cerrado_edicion"
  | "pendiente_compra"
  | "en_compra"
  | "comprado"
  | "en_ruta"
  | "entregado"
  | "parcial"
  | "cancelado"
  | "pendiente_pago"
  | "pagado";

const prismaToUi: Record<OrderStatus, StaffOrderUiStatus> = {
  DRAFT: "borrador",
  CONFIRMED: "confirmado",
  CLOSED_FOR_EDITING: "cerrado_edicion",
  PENDING_PURCHASE: "pendiente_compra",
  IN_PURCHASE: "en_compra",
  PURCHASED: "comprado",
  IN_ROUTE: "en_ruta",
  DELIVERED: "entregado",
  PARTIAL: "parcial",
  CANCELLED: "cancelado",
  PAYMENT_PENDING: "pendiente_pago",
  PAID: "pagado",
};

const uiToPrisma: Record<StaffOrderUiStatus, OrderStatus> = {
  borrador: "DRAFT",
  confirmado: "CONFIRMED",
  cerrado_edicion: "CLOSED_FOR_EDITING",
  pendiente_compra: "PENDING_PURCHASE",
  en_compra: "IN_PURCHASE",
  comprado: "PURCHASED",
  en_ruta: "IN_ROUTE",
  entregado: "DELIVERED",
  parcial: "PARTIAL",
  cancelado: "CANCELLED",
  pendiente_pago: "PAYMENT_PENDING",
  pagado: "PAID",
};

export function orderStatusToUi(s: OrderStatus): StaffOrderUiStatus {
  return prismaToUi[s];
}

export function uiStatusToPrisma(s: string): OrderStatus | null {
  if (s in uiToPrisma) return uiToPrisma[s as StaffOrderUiStatus];
  return null;
}

export function onlyDigitsOrderNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : value;
}

export function nextNumericOrderNumber(): string {
  return `${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
}
