import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminKpis } from "@/lib/admin-kpis";
import { orderStatusToUi } from "./order-mappers";

const revenueLikeUi = new Set([
  "entregado",
  "parcial",
  "pendiente_pago",
  "en_ruta",
  "comprado",
  "pagado",
]);

const pendientesUi = new Set(["borrador", "confirmado", "cerrado_edicion", "pendiente_compra"]);
const enCompraUi = new Set(["en_compra", "comprado"]);
const entregadosUi = new Set(["entregado", "parcial", "pendiente_pago", "pagado"]);

const OWING_PRISMA: OrderStatus[] = ["IN_ROUTE", "DELIVERED", "PARTIAL", "PAYMENT_PENDING"];

export type AdminCustomerMetricRow = {
  customerId: string;
  balancePending: number;
  lastPurchase: string | null;
  sellerName: string;
};

export type AdminSnapshotPayload = {
  kpis: AdminKpis;
  customerMetrics: AdminCustomerMetricRow[];
  purchases: {
    id: string;
    cycleName: string;
    date: string;
    buyerName: string;
    linesCount: number;
    estCost: number;
    realCost: number;
    status: string;
  }[];
  deliveries: {
    id: string;
    routeLabel: string;
    deliveryUser: string;
    date: string;
    ordersCount: number;
    completed: number;
    partial: number;
    status: string;
  }[];
  expenses: {
    id: string;
    date: string;
    type: string;
    amount: number;
    description: string;
    userName: string;
    routeRef?: string;
  }[];
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
  }[];
  audit: {
    id: string;
    at: string;
    user: string;
    action: string;
    entity: string;
    detail: string;
  }[];
};

function cycleStatusLabel(s: string): string {
  if (s === "OPEN") return "Abierto";
  if (s === "CLOSED") return "Cerrado";
  if (s === "IN_PURCHASE") return "En compra";
  if (s === "COMPLETED") return "Completado";
  return s;
}

function routeStatusLabel(route: {
  completedAt: Date | null;
  startedAt: Date | null;
}): string {
  if (route.completedAt) return "Cerrada";
  if (route.startedAt) return "En curso";
  return "Planeada";
}

function runStatusLabel(run: { completedAt: Date | null }, cycleStatus: string): string {
  if (run.completedAt) return "Completada";
  return cycleStatusLabel(cycleStatus);
}

export async function buildAdminSnapshot(): Promise<AdminSnapshotPayload> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    runs,
    routes,
    expenseRows,
    userRows,
    auditRows,
    owingOrders,
    recentOrders,
    customersLite,
    lastOrderByCustomer,
  ] = await Promise.all([
    prisma.purchaseRun.findMany({
      take: 200,
      orderBy: { startedAt: "desc" },
      include: {
        cycle: true,
        buyer: true,
        items: { include: { product: true } },
      },
    }),
    prisma.deliveryRoute.findMany({
      take: 200,
      orderBy: { plannedFor: "desc" },
      include: { deliveryUser: true, cycle: true, deliveries: true },
    }),
    prisma.expense.findMany({
      take: 400,
      orderBy: { createdAt: "desc" },
      include: { createdBy: true },
    }),
    prisma.user.findMany({
      take: 500,
      orderBy: { createdAt: "desc" },
      include: { role: true },
    }),
    prisma.auditEvent.findMany({
      take: 250,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.order.findMany({
      where: { status: { in: OWING_PRISMA } },
      include: { payments: true },
    }),
    prisma.order.findMany({
      take: 4000,
      orderBy: { createdAt: "desc" },
      select: { status: true, createdAt: true, total: true },
    }),
    prisma.customer.findMany({
      select: {
        id: true,
        assignments: { take: 1, include: { seller: { select: { fullName: true } } } },
      },
    }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: { status: { notIn: ["DRAFT", "CANCELLED"] } },
      _max: { createdAt: true },
    }),
  ]);

  const lastMap = new Map(lastOrderByCustomer.map((x) => [x.customerId, x._max.createdAt]));

  const balanceByCustomer = new Map<string, number>();
  for (const o of owingOrders) {
    const paid = o.payments.reduce((s, p) => s + Number(p.amount), 0);
    const pend = Math.max(0, Number(o.total) - paid);
    balanceByCustomer.set(o.customerId, (balanceByCustomer.get(o.customerId) ?? 0) + pend);
  }

  const customerMetrics: AdminCustomerMetricRow[] = customersLite.map((c) => ({
    customerId: c.id,
    balancePending: balanceByCustomer.get(c.id) ?? 0,
    lastPurchase: lastMap.get(c.id) ? lastMap.get(c.id)!.toISOString().slice(0, 10) : null,
    sellerName: c.assignments[0]?.seller.fullName ?? "—",
  }));

  let pendienteCobrar = 0;
  for (const o of owingOrders) {
    const paid = o.payments.reduce((s, p) => s + Number(p.amount), 0);
    pendienteCobrar += Math.max(0, Number(o.total) - paid);
  }

  let ventasHoy = 0;
  let ventasSemana = 0;
  let ventasMes = 0;
  let pedidosPendientes = 0;
  let pedidosEnCompra = 0;
  let pedidosEnRuta = 0;
  let pedidosEntregados = 0;
  let pedidosCancelados = 0;

  for (const o of recentOrders) {
    const d = o.createdAt.toISOString().slice(0, 10);
    const ui = orderStatusToUi(o.status);
    const total = Number(o.total);
    if (revenueLikeUi.has(ui)) {
      if (d === today) ventasHoy += total;
      if (o.createdAt >= weekAgo) ventasSemana += total;
      if (o.createdAt >= monthStart) ventasMes += total;
    }
    if (pendientesUi.has(ui)) pedidosPendientes += 1;
    if (enCompraUi.has(ui)) pedidosEnCompra += 1;
    if (ui === "en_ruta") pedidosEnRuta += 1;
    if (entregadosUi.has(ui)) pedidosEntregados += 1;
    if (ui === "cancelado") pedidosCancelados += 1;
  }

  let comprasHoy = 0;
  let comprasSemana = 0;
  let comprasMes = 0;

  for (const run of runs) {
    let real = 0;
    let est = 0;
    for (const it of run.items) {
      const ref = Number(it.product.referenceCost ?? it.product.salePrice ?? 0);
      est += it.requiredQty * ref;
      const uc = it.unitCost != null ? Number(it.unitCost) : 0;
      real += it.boughtQty * uc;
    }
    const day = run.startedAt.toISOString().slice(0, 10);
    if (day === today) comprasHoy += real;
    if (run.startedAt >= weekAgo) comprasSemana += real;
    if (run.startedAt >= monthStart) comprasMes += real;
  }

  let gastosPeriodo = 0;
  for (const e of expenseRows) {
    if (e.createdAt >= monthStart) gastosPeriodo += Number(e.amount);
  }

  const gananciaBruta = Math.max(0, ventasMes - comprasMes);
  const gananciaNeta = Math.max(0, gananciaBruta - gastosPeriodo);

  const dayStart = new Date(`${today}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
  const paymentsToday = await prisma.payment.aggregate({
    where: { createdAt: { gte: dayStart, lt: dayEnd } },
    _sum: { amount: true },
  });
  const cobradoHoy = Number(paymentsToday._sum.amount ?? 0);

  const activeCustomers = await prisma.customer.count({ where: { status: "ACTIVE" } });
  const clientesConDeuda = customerMetrics.filter((c) => c.balancePending > 0).length;

  const kpis: AdminKpis = {
    ventasHoy,
    ventasSemana,
    ventasMes,
    comprasHoy,
    comprasSemana,
    cobradoHoy,
    pendienteCobrar,
    gananciaBruta,
    gananciaNeta,
    gastosPeriodo,
    pedidosPendientes,
    pedidosEnCompra,
    pedidosEnRuta,
    pedidosEntregados,
    pedidosCancelados,
    clientesActivos: activeCustomers,
    clientesConDeuda,
  };

  const purchases = runs.map((run) => {
    let estCost = 0;
    let realCost = 0;
    for (const it of run.items) {
      const ref = Number(it.product.referenceCost ?? it.product.salePrice ?? 0);
      estCost += it.requiredQty * ref;
      const uc = it.unitCost != null ? Number(it.unitCost) : 0;
      realCost += it.boughtQty * uc;
    }
    return {
      id: run.id,
      cycleName: run.cycle.name,
      date: run.startedAt.toISOString().slice(0, 10),
      buyerName: run.buyer.fullName,
      linesCount: run.items.length,
      estCost,
      realCost,
      status: runStatusLabel(run, run.cycle.status),
    };
  });

  const deliveries = routes.map((route) => {
    const completed = route.deliveries.filter((d) => d.status === "DELIVERED").length;
    const partial = route.deliveries.filter((d) => d.status === "PARTIAL").length;
    return {
      id: route.id,
      routeLabel: route.cycle?.name ?? `Ruta ${route.plannedFor.toISOString().slice(0, 10)}`,
      deliveryUser: route.deliveryUser.fullName,
      date: route.plannedFor.toISOString().slice(0, 10),
      ordersCount: route.deliveries.length,
      completed,
      partial,
      status: routeStatusLabel(route),
    };
  });

  const expenses = expenseRows.map((e) => ({
    id: e.id,
    date: e.createdAt.toISOString().slice(0, 10),
    type: e.kind,
    amount: Number(e.amount),
    description: e.notes?.trim() ? e.notes : "—",
    userName: e.createdBy.fullName,
    routeRef: e.deliveryRouteId ?? undefined,
  }));

  const users = userRows.map((u) => ({
    id: u.id,
    name: u.fullName,
    email: u.email,
    role: u.role.code,
    active: u.status === "ACTIVE",
  }));

  const audit = auditRows.map((a) => {
    const detailParts = [a.entity, a.entityId, a.action].filter(Boolean).join(" · ");
    return {
      id: a.id,
      at: a.createdAt.toISOString(),
      user: a.user?.fullName ?? "Sistema",
      action: a.action,
      entity: a.entity,
      detail: detailParts.slice(0, 280),
    };
  });

  return {
    kpis,
    customerMetrics,
    purchases,
    deliveries,
    expenses,
    users,
    audit,
  };
}
