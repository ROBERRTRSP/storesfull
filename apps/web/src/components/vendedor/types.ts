export type VisitStatus =
  | "pendiente"
  | "visitado"
  | "no_encontrado"
  | "reagendado"
  | "pedido_creado"
  | "sin_pedido"
  | "seguimiento_pendiente";

export type FollowUpStatus =
  | "pendiente"
  | "visitado"
  | "reagendado"
  | "no_encontrado"
  | "pedido_creado"
  | "pedido_pendiente_confirmar"
  | "cliente_inactivo"
  | "cliente_recuperado";

export type OrderStatusSeller =
  | "borrador"
  | "confirmado"
  | "en_proceso"
  | "entregado"
  | "cancelado";

export type SellerCustomer = {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  address: string;
  zone: string;
  visitDay: string;
  gpsLink?: string;
  balancePending: number;
  lastPurchaseDate: string | null;
  purchaseFrequencyDays: number;
  avgTicket: number;
  status: "activo" | "nuevo" | "inactivo" | "riesgo";
  tags: string[];
};

export type SellerOrderLine = { productId: string; name: string; qty: number; unitPrice: number };

export type SellerOrder = {
  id: string;
  customerId: string;
  status: OrderStatusSeller;
  createdAt: string;
  lines: SellerOrderLine[];
  note?: string;
  sellerNote?: string;
};

export type SellerVisit = {
  id: string;
  customerId: string;
  date: string;
  sortOrder: number;
  status: VisitStatus;
  quickNote?: string;
};

export type SellerFollowUp = {
  id: string;
  customerId: string;
  text: string;
  createdAt: string;
  status: FollowUpStatus;
  dueDate?: string;
};

export type SellerOffer = {
  id: string;
  title: string;
  description: string;
  productNames: string[];
  validUntil: string;
  type: "descuento_cantidad" | "combo" | "temporal" | "destacado" | "volumen";
  suggestedForZones?: string[];
};

export type SellerOpportunity = {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  detail: string;
  priority: "alta" | "media" | "baja";
};

export type CatalogProduct = {
  id: string;
  name: string;
  unit: string;
  price: number;
  tags: string[];
  isOffer?: boolean;
};

export type SellerProfile = {
  name: string;
  email: string;
  phone: string;
  zoneLabel: string;
};
