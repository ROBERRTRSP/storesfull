import type {
  AdminAlert,
  AdminAuditEntry,
  AdminCustomer,
  AdminDelivery,
  AdminExpense,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminPurchase,
  AdminUser,
} from "./types";

export const adminCustomersSeed: AdminCustomer[] = [
  {
    id: "c1",
    businessName: "Bodega La 9",
    contactName: "Carlos Perez",
    phone: "+17865550100",
    email: "bodega9@email.com",
    zone: "Zona A",
    visitDay: "Lunes",
    sellerName: "Maria Vendedora",
    active: true,
    creditLimit: 2000,
    balancePending: 120.5,
    lastPurchase: "2026-03-20",
  },
  {
    id: "c2",
    businessName: "Mini Market Sol",
    contactName: "Ana Ruiz",
    phone: "+17865550200",
    email: "sol@email.com",
    zone: "Zona B",
    visitDay: "Lunes",
    sellerName: "Maria Vendedora",
    active: true,
    creditLimit: 800,
    balancePending: 0,
    lastPurchase: "2026-03-01",
  },
  {
    id: "c3",
    businessName: "Colmado El Progreso",
    contactName: "Luis Gomez",
    phone: "+17865550300",
    email: "progreso@email.com",
    zone: "Zona A",
    visitDay: "Martes",
    sellerName: "Pedro Ruta",
    active: true,
    creditLimit: 5000,
    balancePending: 340,
    lastPurchase: "2026-03-25",
  },
];

export const adminProductsSeed: AdminProduct[] = [
  {
    id: "p1",
    name: "Arroz 1kg",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop&q=80",
    department: "Abarrotes",
    category: "Granos",
    sku: "ARROZ-1KG",
    unit: "unidad",
    salePrice: 2.5,
    refCost: 1.8,
    active: true,
    tags: ["promo"],
  },
  {
    id: "p2",
    name: "Aceite 1L",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop&q=80",
    department: "Abarrotes",
    category: "Aceites",
    sku: "ACEITE-1L",
    unit: "unidad",
    salePrice: 4.2,
    refCost: 3.1,
    active: true,
    tags: [],
  },
  {
    id: "p3",
    name: "Pasta 500g",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&h=200&fit=crop&q=80",
    department: "Abarrotes",
    category: "Pastas",
    sku: "PASTA-500",
    unit: "unidad",
    salePrice: 1.9,
    refCost: 1.2,
    active: true,
    tags: ["combo"],
  },
  {
    id: "p4",
    name: "Refresco 2L",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-2f84a1cd1ed5?w=200&h=200&fit=crop&q=80",
    department: "Bebidas",
    category: "Gaseosas",
    sku: "REF-2L",
    unit: "unidad",
    salePrice: 2.8,
    refCost: 2.0,
    active: true,
    tags: [],
  },
  {
    id: "p5",
    name: "Agua 600ml",
    imageUrl: "https://images.unsplash.com/photo-1548839140-2a99cbd6f49f?w=200&h=200&fit=crop&q=80",
    department: "Bebidas",
    category: "Agua",
    sku: "AGUA-600",
    unit: "unidad",
    salePrice: 0.75,
    refCost: 0.45,
    active: true,
    tags: [],
  },
  {
    id: "p6",
    name: "Detergente 1L",
    imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200&h=200&fit=crop&q=80",
    department: "Limpieza",
    category: "Lavandería",
    sku: "DET-1L",
    unit: "unidad",
    salePrice: 5.5,
    refCost: 3.8,
    active: true,
    tags: [],
  },
  {
    id: "p7",
    name: "Papel higiénico 4 rollos",
    imageUrl: "https://images.unsplash.com/photo-1583947215259-62d2e7d0b7e5?w=200&h=200&fit=crop&q=80",
    department: "Higiene",
    category: "Papel",
    sku: "PH-4R",
    unit: "paquete",
    salePrice: 3.2,
    refCost: 2.4,
    active: true,
    tags: [],
  },
];

export const adminOrdersSeed: AdminOrder[] = [
  { id: "o1", number: "1001", customerId: "c1", customerName: "Bodega La 9", createdBy: "seller@demo.local", sellerName: "Maria Vendedora", date: "2026-03-27", total: 41.8, status: "borrador", routeLabel: "Ruta N1" },
  { id: "o2", number: "1000", customerId: "c1", customerName: "Bodega La 9", createdBy: "customer@demo.local", sellerName: "Maria Vendedora", date: "2026-03-20", total: 95.6, status: "entregado", routeLabel: "Ruta N1" },
  { id: "o3", number: "998", customerId: "c3", customerName: "Colmado El Progreso", createdBy: "seller@demo.local", sellerName: "Pedro Ruta", date: "2026-03-25", total: 220, status: "pendiente_pago", routeLabel: "Ruta S2" },
  { id: "o4", number: "997", customerId: "c2", customerName: "Mini Market Sol", createdBy: "admin@demo.local", sellerName: "Maria Vendedora", date: "2026-03-18", total: 55, status: "en_compra", routeLabel: "Ruta N1" },
];

export const adminPurchasesSeed: AdminPurchase[] = [
  { id: "pc1", cycleName: "Ciclo 12-16 Mar", date: "2026-03-16", buyerName: "Juan Compras", linesCount: 18, estCost: 420, realCost: 405.5, status: "cerrada" },
  { id: "pc2", cycleName: "Ciclo 19-23 Mar", date: "2026-03-23", buyerName: "Juan Compras", linesCount: 22, estCost: 510, realCost: 0, status: "en_compra" },
];

export const adminDeliveriesSeed: AdminDelivery[] = [
  { id: "d1", routeLabel: "Ruta N1", deliveryUser: "Carlos Delivery", date: "2026-03-27", ordersCount: 6, completed: 4, partial: 1, status: "en_curso" },
  { id: "d2", routeLabel: "Ruta S2", deliveryUser: "Luis Delivery", date: "2026-03-26", ordersCount: 5, completed: 5, partial: 0, status: "cerrada" },
];

export const adminPaymentsSeed: AdminPayment[] = [
  { id: "pay1", date: "2026-03-27", customerName: "Bodega La 9", amount: 80, method: "zelle", orderRef: "1000", recordedBy: "Maria Vendedora" },
  { id: "pay2", date: "2026-03-26", customerName: "Colmado El Progreso", amount: 150, method: "efectivo", orderRef: "995", recordedBy: "Carlos Delivery" },
];

export const adminExpensesSeed: AdminExpense[] = [
  { id: "e1", date: "2026-03-27", type: "gasolina", amount: 45, description: "Ruta N1", userName: "Carlos Delivery", routeRef: "Ruta N1" },
  { id: "e2", date: "2026-03-26", type: "peajes", amount: 8.5, description: "Autopista", userName: "Luis Delivery", routeRef: "Ruta S2" },
];

export const adminUsersSeed: AdminUser[] = [
  { id: "u1", name: "Admin Demo", email: "admin@demo.local", role: "ADMIN", active: true },
  { id: "u2", name: "Maria Vendedora", email: "seller@demo.local", role: "SELLER", active: true },
  { id: "u3", name: "Carlos Delivery", email: "delivery@demo.local", role: "DELIVERY", active: true },
  { id: "u4", name: "Cliente Demo", email: "customer@demo.local", role: "CUSTOMER", active: true },
];

export const adminAuditSeed: AdminAuditEntry[] = [
  { id: "a1", at: "2026-03-27 09:12", user: "admin@demo.local", action: "UPDATE", entity: "Producto", detail: "Arroz 1kg precio venta 2.50" },
  { id: "a2", at: "2026-03-27 08:40", user: "seller@demo.local", action: "CREATE", entity: "Pedido", detail: "Pedido #1001 borrador" },
  { id: "a3", at: "2026-03-26 17:05", user: "delivery@demo.local", action: "UPDATE", entity: "Entrega", detail: "Ruta S2 completada" },
];

export const adminAlertsSeed: AdminAlert[] = [
  { id: "al1", title: "Pedido retrasado en compra", detail: "Pedido #997 lleva 2 dias en compra sin cierre.", severity: "alta", state: "pendiente", createdAt: "2026-03-27" },
  { id: "al2", title: "Cliente con deuda elevada", detail: "Colmado El Progreso supera 50% limite credito.", severity: "media", state: "pendiente", createdAt: "2026-03-26" },
  { id: "al3", title: "Entrega parcial pendiente", detail: "Ruta N1: 1 pedido parcial sin nota de cierre.", severity: "media", state: "revisado", createdAt: "2026-03-25" },
];

export const dashboardKpisSeed = {
  ventasHoy: 128.4,
  ventasSemana: 1840.2,
  ventasMes: 7240,
  comprasHoy: 0,
  comprasSemana: 405.5,
  cobradoHoy: 80,
  pendienteCobrar: 460.5,
  gananciaBruta: 1434.7,
  gananciaNeta: 1381.2,
  gastosPeriodo: 53.5,
  pedidosPendientes: 2,
  pedidosEnCompra: 1,
  pedidosEnRuta: 1,
  pedidosEntregados: 12,
  pedidosCancelados: 1,
  clientesActivos: 42,
  clientesConDeuda: 8,
};
