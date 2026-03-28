import type {
  DeliveryLineStatus,
  DriverCustomer,
  DriverOrder,
  DriverOrderLine,
  DriverPayment,
  PaymentMethod,
} from "@/components/conductor/types";

/** Fila de lista staff/orders (campos extra son compatibles con admin/vendedor). */
export type StaffOrderListRow = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerContactName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  customerGpsLink?: string | null;
  date: string;
  createdAt?: string;
  total: number;
  paidTotal?: number;
  status: string;
  items: { productId: string; productName: string; qty: number; unitPrice: number }[];
};

export type StaffPaymentListRow = {
  id: string;
  date: string;
  createdAt?: string;
  customerId: string;
  orderId?: string | null;
  amount: number;
  method: string;
  recordedBy: string;
};

const POST_PURCHASE = new Set([
  "comprado",
  "en_ruta",
  "entregado",
  "parcial",
  "pendiente_pago",
  "pagado",
]);

const POST_DELIVERY_FULL = new Set(["entregado", "pendiente_pago", "pagado"]);

function paymentMethodFromApiLabel(method: string): PaymentMethod {
  const m = method.trim().toLowerCase();
  if (m.includes("zelle")) return "zelle";
  if (m.includes("transfer") || m.includes("ach")) return "transferencia";
  if (m.includes("cash") || m.includes("efect")) return "efectivo";
  if (m.includes("credito") || m.includes("crédito") || m.includes("pendiente")) return "credito_pendiente";
  return "otro";
}

function apiMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    efectivo: "Efectivo",
    zelle: "Zelle",
    transferencia: "Transferencia",
    cash_app: "Cash App",
    credito_pendiente: "Crédito pendiente",
    otro: "Otro",
  };
  return labels[method];
}

export function paymentMethodToApiString(method: PaymentMethod): string {
  return apiMethodLabel(method);
}

function staffUiToDriverOrderStatus(status: string): DriverOrder["status"] {
  if (["borrador", "confirmado", "cerrado_edicion", "pendiente_compra", "en_compra"].includes(status)) {
    return "confirmado";
  }
  if (status === "comprado" || status === "en_ruta") return "listo_ruta";
  if (status === "parcial") return "entrega_parcial";
  if (status === "entregado" || status === "pendiente_pago" || status === "pagado") return "entregado";
  if (status === "cancelado") return "no_entregado";
  return "confirmado";
}

function buildLine(
  item: StaffOrderListRow["items"][0],
  staffStatus: string,
): DriverOrderLine {
  const qtyOrdered = item.qty;
  const unitSalePrice = item.unitPrice;
  let qtyPurchased = 0;
  let purchaseStatus: DriverOrderLine["purchaseStatus"] = "pendiente";
  if (POST_PURCHASE.has(staffStatus)) {
    qtyPurchased = qtyOrdered;
    purchaseStatus = "comprado";
  } else if (staffStatus === "en_compra") {
    purchaseStatus = "pendiente";
  }

  let qtyDelivered = 0;
  let deliveryStatus: DeliveryLineStatus = "pendiente";
  if (staffStatus === "cancelado") {
    deliveryStatus = "no_entregado";
  } else if (POST_DELIVERY_FULL.has(staffStatus)) {
    qtyDelivered = qtyPurchased;
    deliveryStatus = "entregado";
  } else if (staffStatus === "parcial") {
    qtyDelivered = 0;
    deliveryStatus = "parcial";
  }

  return {
    productId: item.productId,
    productName: item.productName,
    qtyOrdered,
    qtyPurchased,
    qtyDelivered,
    unitSalePrice,
    unitCostEstimate: 0,
    purchaseStatus,
    deliveryStatus,
  };
}

export function staffOrdersToDriverOrders(rows: StaffOrderListRow[]): DriverOrder[] {
  return rows.map((row) => {
    const paidTotal = Number(row.paidTotal ?? 0);
    const orderTotal = Number(row.total);
    let paymentStatus: DriverOrder["paymentStatus"] = "pendiente";
    if (paidTotal >= orderTotal - 1e-6 && orderTotal > 0) paymentStatus = "cobrado";
    else if (paidTotal > 0) paymentStatus = "parcial";

    const lines = row.items.map((it) => buildLine(it, row.status));
    return {
      id: row.id,
      customerId: row.customerId,
      status: staffUiToDriverOrderStatus(row.status),
      paymentStatus,
      amountPaid: paidTotal,
      lines,
      createdAt: row.createdAt ?? row.date,
      note: undefined,
    };
  });
}

export function staffOrdersToDriverCustomers(rows: StaffOrderListRow[]): DriverCustomer[] {
  const map = new Map<string, DriverCustomer>();
  let n = 1;
  for (const row of rows) {
    if (map.has(row.customerId)) continue;
    map.set(row.customerId, {
      id: row.customerId,
      businessName: row.customerName,
      contactName: row.customerContactName ?? "",
      phone: row.customerPhone ?? "",
      address: row.customerAddress ?? "",
      zone: "",
      gpsLink: row.customerGpsLink ?? "",
      visitOrder: n++,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.visitOrder - b.visitOrder);
}

export function staffPaymentsToDriverPayments(
  rows: StaffPaymentListRow[],
  recordedByFallback: string,
): DriverPayment[] {
  return rows.map((p) => ({
    id: p.id,
    at: p.createdAt ?? `${p.date}T12:00:00.000Z`,
    customerId: p.customerId,
    orderIds: p.orderId ? [p.orderId] : [],
    amount: p.amount,
    splits: [{ method: paymentMethodFromApiLabel(p.method), amount: p.amount }],
    note: undefined,
    recordedBy: p.recordedBy?.trim() ? p.recordedBy : recordedByFallback,
  }));
}
