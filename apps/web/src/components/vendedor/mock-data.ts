import type {
  CatalogProduct,
  SellerCustomer,
  SellerFollowUp,
  SellerOffer,
  SellerOpportunity,
  SellerOrder,
  SellerProfile,
  SellerVisit,
} from "./types";

export const sellerProfileSeed: SellerProfile = {
  name: "Maria Vendedora",
  email: "seller@demo.local",
  phone: "+1 786 000 1111",
  zoneLabel: "Zona Norte + Ruta 3",
};

export const catalogSeed: CatalogProduct[] = [
  { id: "p1", name: "Arroz 1kg", unit: "unidad", price: 2.5, tags: ["granos", "frecuente"] },
  { id: "p2", name: "Aceite 1L", unit: "unidad", price: 4.2, tags: ["despensa"] },
  { id: "p3", name: "Pasta 500g", unit: "unidad", price: 1.9, tags: ["combo", "frecuente"] },
  { id: "p4", name: "Azucar 1kg", unit: "unidad", price: 2.2, tags: ["despensa"] },
  { id: "p5", name: "Harina PAN", unit: "unidad", price: 1.8, tags: ["harinas"] },
  { id: "p6", name: "Leche entera 1L", unit: "unidad", price: 3.1, tags: ["lacteos", "frio"], isOffer: true },
];

export const customersSeed: SellerCustomer[] = [
  {
    id: "c1",
    businessName: "Bodega La 9",
    contactName: "Carlos Perez",
    phone: "+17865550100",
    address: "NW 12th St, Miami",
    zone: "Zona A",
    visitDay: "Lunes",
    gpsLink: "https://maps.google.com/?q=25.78,-80.23",
    balancePending: 120.5,
    lastPurchaseDate: "2026-03-20",
    purchaseFrequencyDays: 7,
    avgTicket: 85,
    status: "activo",
    tags: ["frecuente"],
  },
  {
    id: "c2",
    businessName: "Mini Market Sol",
    contactName: "Ana Ruiz",
    phone: "+17865550200",
    address: "Calle 8, Hialeah",
    zone: "Zona B",
    visitDay: "Lunes",
    balancePending: 0,
    lastPurchaseDate: "2026-03-01",
    purchaseFrequencyDays: 14,
    avgTicket: 45,
    status: "riesgo",
    tags: ["sin_compra"],
  },
  {
    id: "c3",
    businessName: "Colmado El Progreso",
    contactName: "Luis Gomez",
    phone: "+17865550300",
    address: "Flagler St",
    zone: "Zona A",
    visitDay: "Martes",
    balancePending: 340,
    lastPurchaseDate: "2026-03-25",
    purchaseFrequencyDays: 5,
    avgTicket: 210,
    status: "activo",
    tags: ["balance"],
  },
  {
    id: "c4",
    businessName: "Abasto Express",
    contactName: "Rosa M.",
    phone: "+17865550400",
    address: "Kendall",
    zone: "Zona C",
    visitDay: "Nuevo",
    balancePending: 0,
    lastPurchaseDate: null,
    purchaseFrequencyDays: 30,
    avgTicket: 0,
    status: "nuevo",
    tags: ["nuevo"],
  },
];

export const ordersSeed: SellerOrder[] = [
  {
    id: "o1",
    customerId: "c1",
    status: "borrador",
    createdAt: "2026-03-27",
    note: "Cliente pidio revisar aceite",
    lines: [
      { productId: "p1", name: "Arroz 1kg", qty: 10, unitPrice: 2.5 },
      { productId: "p2", name: "Aceite 1L", qty: 4, unitPrice: 4.2 },
    ],
  },
  {
    id: "o2",
    customerId: "c1",
    status: "confirmado",
    createdAt: "2026-03-20",
    lines: [
      { productId: "p1", name: "Arroz 1kg", qty: 20, unitPrice: 2.5 },
      { productId: "p3", name: "Pasta 500g", qty: 24, unitPrice: 1.9 },
    ],
  },
  {
    id: "o3",
    customerId: "c3",
    status: "entregado",
    createdAt: "2026-03-25",
    lines: [{ productId: "p4", name: "Azucar 1kg", qty: 15, unitPrice: 2.2 }],
  },
];

const today = new Date().toISOString().slice(0, 10);

export const visitsTodaySeed: SellerVisit[] = [
  { id: "v1", customerId: "c1", date: today, sortOrder: 1, status: "pendiente" },
  { id: "v2", customerId: "c2", date: today, sortOrder: 2, status: "pendiente", quickNote: "Llamar antes" },
  { id: "v3", customerId: "c3", date: today, sortOrder: 3, status: "visitado" },
];

export const followUpsSeed: SellerFollowUp[] = [
  {
    id: "f1",
    customerId: "c2",
    text: "Cliente quiere visita el jueves; comparando precios",
    createdAt: "2026-03-26",
    status: "pendiente",
    dueDate: "2026-03-28",
  },
  {
    id: "f2",
    customerId: "c1",
    text: "Ofrecer combo pasta + salsa",
    createdAt: "2026-03-25",
    status: "visitado",
  },
];

export const offersSeed: SellerOffer[] = [
  {
    id: "of1",
    title: "2+1 Arroz fin de mes",
    description: "Lleva 2 bolsas y la tercera con 15% off",
    productNames: ["Arroz 1kg"],
    validUntil: "2026-03-31",
    type: "descuento_cantidad",
    suggestedForZones: ["Zona A"],
  },
  {
    id: "of2",
    title: "Combo Despensa",
    description: "Aceite + Pasta + Azucar con precio cerrado",
    productNames: ["Aceite 1L", "Pasta 500g", "Azucar 1kg"],
    validUntil: "2026-04-05",
    type: "combo",
  },
  {
    id: "of3",
    title: "Leche destacada",
    description: "Incentivo por volumen en frio",
    productNames: ["Leche entera 1L"],
    validUntil: "2026-03-30",
    type: "temporal",
  },
];

export const opportunitiesSeed: SellerOpportunity[] = [
  {
    id: "op1",
    customerId: "c1",
    customerName: "Bodega La 9",
    title: "Arroz: suele pedir 20 unidades",
    detail: "Esta semana aun no pidio arroz; su ultimo pedido fue hace 7 dias.",
    priority: "alta",
  },
  {
    id: "op2",
    customerId: "c2",
    customerName: "Mini Market Sol",
    title: "Cliente inactivo 26 días",
    detail: "Su frecuencia habitual es 14 dias; conviene recuperar con oferta combo.",
    priority: "alta",
  },
  {
    id: "op3",
    customerId: "c3",
    customerName: "Colmado El Progreso",
    title: "Oferta leche en frio",
    detail: "Compra lacteos regularmente; hay promo activa en leche entera.",
    priority: "media",
  },
];
