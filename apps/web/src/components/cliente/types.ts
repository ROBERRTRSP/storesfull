export type OrderStatus =
  | "borrador"
  | "confirmado"
  | "pendiente_de_compra"
  | "en_compra"
  | "comprado"
  | "en_ruta"
  | "entregado"
  | "parcial"
  | "cancelado"
  | "pendiente_de_pago"
  | "pagado";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  promo?: string;
  combo?: string;
};

export type CartItem = {
  productId: string;
  qty: number;
};

export type ClientOrder = {
  id: string;
  /** Numero de pedido solo digitos (para mostrar al cliente). */
  orderNumber?: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  note?: string;
};

export type Payment = {
  id: string;
  date: string;
  amount: number;
  method: string;
};

export type DocumentItem = {
  id: string;
  /** Numero de documento (solo digitos para factura/recibo). */
  number: string;
  type: "factura" | "recibo";
  orderId: string;
  /** Numero de pedido asociado (digitos), si aplica. */
  orderNumber?: string;
  date: string;
  total: number;
};

export type ClientProfile = {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  weeklyReminder: boolean;
};

