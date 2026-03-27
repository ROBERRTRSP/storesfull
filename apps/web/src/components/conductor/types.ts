/** Estados de compra por línea / agregado */
export type PurchaseLineStatus = "pendiente" | "comprado" | "parcial" | "no_encontrado" | "sustituido";

/** Estados de entrega por línea */
export type DeliveryLineStatus = "pendiente" | "entregado" | "parcial" | "no_entregado" | "sustituido";

/** Visita en ruta */
export type RouteVisitStatus =
  | "pendiente"
  | "en_ruta"
  | "visitado"
  | "entregado"
  | "parcial"
  | "no_entregado"
  | "reagendado";

export type PaymentMethod = "efectivo" | "zelle" | "transferencia" | "cash_app" | "credito_pendiente" | "otro";

export type IncidentType =
  | "producto_no_encontrado"
  | "direccion_incorrecta"
  | "cliente_ausente"
  | "entrega_parcial"
  | "cliente_no_pago"
  | "sustitucion"
  | "reagendado"
  | "problema_pago"
  | "problema_entrega"
  | "otro";

export type IncidentResolution = "abierta" | "en_curso" | "cerrada";

export type DriverProfile = {
  name: string;
  email: string;
  phone: string;
  vehicleLabel: string;
};

export type DriverCustomer = {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  address: string;
  zone: string;
  gpsLink: string;
  visitOrder: number;
};

/** Línea operativa dentro de un pedido del conductor */
export type DriverOrderLine = {
  productId: string;
  productName: string;
  qtyOrdered: number;
  qtyPurchased: number;
  qtyDelivered: number;
  unitSalePrice: number;
  /** Costo referencia estimado (no editable libre por driver salvo registro real) */
  unitCostEstimate: number;
  unitCostReal?: number;
  purchaseStatus: PurchaseLineStatus;
  deliveryStatus: DeliveryLineStatus;
  supplier?: string;
  purchaseNote?: string;
  substitutionProductName?: string;
  deliveryNote?: string;
  /** data URL demo para comprobante / factura */
  receiptPhotoDataUrl?: string;
};

export type DriverOrder = {
  id: string;
  customerId: string;
  status: "confirmado" | "listo_ruta" | "entrega_parcial" | "entregado" | "no_entregado";
  paymentStatus: "pendiente" | "parcial" | "cobrado";
  amountPaid: number;
  lines: DriverOrderLine[];
  createdAt: string;
  note?: string;
};

export type DriverPaymentSplit = {
  method: PaymentMethod;
  amount: number;
};

export type DriverPayment = {
  id: string;
  at: string;
  customerId: string;
  orderIds: string[];
  amount: number;
  splits: DriverPaymentSplit[];
  note?: string;
  recordedBy: string;
};

export type DriverReceipt = {
  id: string;
  createdAt: string;
  customerId: string;
  paymentId: string;
  orderIds: string[];
  summaryLines: { productName: string; qty: number; subtotal: number }[];
  totalSale: number;
  amountPaid: number;
  amountPending: number;
  methodsLabel: string;
};

export type DriverIncident = {
  id: string;
  at: string;
  type: IncidentType;
  description: string;
  customerId?: string;
  orderId?: string;
  resolution: IncidentResolution;
  recordedBy: string;
};

export type JornadaCierre = {
  id: string;
  date: string;
  closedAt: string;
  note?: string;
  stats: {
    pedidosAsignados: number;
    pedidosEntregados: number;
    pedidosParciales: number;
    pedidosNoEntregados: number;
    totalVenta: number;
    totalCompraReal: number;
    totalCobrado: number;
    cobradoEfectivo: number;
    cobradoDigital: number;
    totalPendiente: number;
    incidencias: number;
  };
};

/** Fila agregada lista de compra */
export type PurchaseAggregateRow = {
  productId: string;
  productName: string;
  qtyRequired: number;
  qtyPurchased: number;
  qtyPending: number;
  purchaseStatus: PurchaseLineStatus;
  costEstimateTotal: number;
  costRealTotal: number;
  supplier?: string;
  orderIds: string[];
  customerIds: string[];
  customerNames: string[];
};
