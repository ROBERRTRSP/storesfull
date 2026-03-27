import { ClientOrder, ClientProfile, DocumentItem, Payment, Product } from "./types";

export const productsSeed: Product[] = [
  { id: "p1", name: "Arroz 1kg", category: "Granos", price: 2.5, unit: "unidad", promo: "2x1 viernes" },
  { id: "p2", name: "Aceite 1L", category: "Despensa", price: 4.2, unit: "unidad" },
  { id: "p3", name: "Pasta 500g", category: "Despensa", price: 1.9, unit: "unidad", combo: "Combo Pasta + Salsa" },
  { id: "p4", name: "Azucar 1kg", category: "Granos", price: 2.2, unit: "unidad" },
  { id: "p5", name: "Harina PAN", category: "Harinas", price: 1.8, unit: "unidad", promo: "Oferta semanal" },
];

export const ordersSeed: ClientOrder[] = [
  {
    id: "ord-1001",
    orderNumber: "1001",
    createdAt: "2026-03-20",
    status: "en_ruta",
    items: [
      { productId: "p1", qty: 10 },
      { productId: "p2", qty: 6 },
    ],
  },
  {
    id: "ord-1000",
    orderNumber: "1000",
    createdAt: "2026-03-12",
    status: "pagado",
    items: [
      { productId: "p3", qty: 12 },
      { productId: "p5", qty: 10 },
    ],
  },
];

export const paymentsSeed: Payment[] = [
  { id: "pay-1", date: "2026-03-15", amount: 40, method: "zelle" },
  { id: "pay-2", date: "2026-03-22", amount: 55, method: "efectivo" },
];

export const docsSeed: DocumentItem[] = [
  {
    id: "doc-1",
    number: "1000",
    type: "factura",
    orderId: "ord-1000",
    orderNumber: "1000",
    date: "2026-03-12",
    total: 41.8,
  },
  {
    id: "doc-2",
    number: "20260315120000000",
    type: "recibo",
    orderId: "ord-1000",
    orderNumber: "1000",
    date: "2026-03-15",
    total: 40,
  },
];

export const profileSeed: ClientProfile = {
  businessName: "Bodega La 9",
  contactName: "Carlos Perez",
  phone: "+1 786 000 0000",
  email: "bodega9@email.com",
  address: "Miami, FL",
  weeklyReminder: true,
};

