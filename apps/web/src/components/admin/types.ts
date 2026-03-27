export type AdminOrderStatus =
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

export type AlertSeverity = "critica" | "alta" | "media" | "baja";
export type AlertState = "pendiente" | "revisado" | "resuelto";

export type AdminCustomer = {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  zone: string;
  visitDay: string;
  sellerName: string;
  active: boolean;
  creditLimit: number;
  balancePending: number;
  lastPurchase: string | null;
};

export type AdminProduct = {
  id: string;
  name: string;
  /** URL de foto (absoluta o bajo /public) */
  imageUrl: string;
  /** Departamento de tienda (ej. Abarrotes, Bebidas) */
  department: string;
  /** Subcategoría o línea dentro del departamento */
  category: string;
  sku: string;
  unit: string;
  salePrice: number;
  refCost: number;
  active: boolean;
  tags: string[];
};

export type AdminOrder = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  createdBy: string;
  sellerName: string;
  date: string;
  total: number;
  status: AdminOrderStatus;
  routeLabel?: string;
};

export type AdminPurchase = {
  id: string;
  cycleName: string;
  date: string;
  buyerName: string;
  linesCount: number;
  estCost: number;
  realCost: number;
  status: string;
};

export type AdminDelivery = {
  id: string;
  routeLabel: string;
  deliveryUser: string;
  date: string;
  ordersCount: number;
  completed: number;
  partial: number;
  status: string;
};

export type AdminPayment = {
  id: string;
  date: string;
  customerName: string;
  amount: number;
  method: string;
  orderRef?: string;
  recordedBy: string;
};

export type AdminExpense = {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  userName: string;
  routeRef?: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export type AdminAuditEntry = {
  id: string;
  at: string;
  user: string;
  action: string;
  entity: string;
  detail: string;
};

export type AdminAlert = {
  id: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  state: AlertState;
  createdAt: string;
};
