import type {
  AdminAlert,
  AdminCustomer,
  AdminOrder,
  AdminOrderStatus,
  AdminPayment,
} from "@/components/admin/types";

export type AdminKpis = {
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  comprasHoy: number;
  comprasSemana: number;
  cobradoHoy: number;
  pendienteCobrar: number;
  gananciaBruta: number;
  gananciaNeta: number;
  gastosPeriodo: number;
  pedidosPendientes: number;
  pedidosEnCompra: number;
  pedidosEnRuta: number;
  pedidosEntregados: number;
  pedidosCancelados: number;
  clientesActivos: number;
  clientesConDeuda: number;
};

const revenueLike = new Set<AdminOrderStatus>([
  "entregado",
  "parcial",
  "pendiente_pago",
  "pagado",
  "en_ruta",
  "comprado",
]);

export function deriveAdminKpis(
  orders: AdminOrder[],
  customers: AdminCustomer[],
  payments: AdminPayment[],
): AdminKpis {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const ventasHoy = orders
    .filter((o) => o.date === today && revenueLike.has(o.status))
    .reduce((s, o) => s + o.total, 0);
  const ventasSemana = orders
    .filter((o) => new Date(o.date) >= weekAgo && revenueLike.has(o.status))
    .reduce((s, o) => s + o.total, 0);
  const ventasMes = orders
    .filter((o) => new Date(o.date) >= monthStart && revenueLike.has(o.status))
    .reduce((s, o) => s + o.total, 0);

  const cobradoHoy = payments.filter((p) => p.date === today).reduce((s, p) => s + p.amount, 0);
  const invoicedOpen = orders
    .filter((o) => ["entregado", "parcial", "pendiente_pago", "en_ruta"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);
  const paidTotal = payments.reduce((s, p) => s + p.amount, 0);
  const pendienteCobrar = Math.max(invoicedOpen - paidTotal, 0);

  return {
    ventasHoy,
    ventasSemana,
    ventasMes,
    comprasHoy: 0,
    comprasSemana: 0,
    cobradoHoy,
    pendienteCobrar,
    gananciaBruta: 0,
    gananciaNeta: 0,
    gastosPeriodo: 0,
    pedidosPendientes: orders.filter((o) =>
      ["borrador", "confirmado", "cerrado_edicion", "pendiente_compra"].includes(o.status),
    ).length,
    pedidosEnCompra: orders.filter((o) => ["en_compra", "comprado"].includes(o.status)).length,
    pedidosEnRuta: orders.filter((o) => o.status === "en_ruta").length,
    pedidosEntregados: orders.filter((o) =>
      ["entregado", "parcial", "pendiente_pago", "pagado"].includes(o.status),
    ).length,
    pedidosCancelados: orders.filter((o) => o.status === "cancelado").length,
    clientesActivos: customers.filter((c) => c.active).length,
    clientesConDeuda: customers.filter((c) => c.balancePending > 0).length,
  };
}

/** Alertas derivadas de datos reales (sin tabla propia). */
export function deriveAdminAlerts(orders: AdminOrder[], customers: AdminCustomer[]): AdminAlert[] {
  const out: AdminAlert[] = [];
  const now = Date.now();

  for (const o of orders) {
    if (o.status === "pendiente_compra") {
      const t = new Date(o.date).getTime();
      if (Number.isFinite(t) && (now - t) / 86400000 > 2) {
        out.push({
          id: `alert-pedido-sin-compra-${o.id}`,
          title: "Pedido sin pasar a compra",
          detail: `Pedido #${o.number} · ${o.customerName} · desde ${o.date}`,
          severity: "media",
          state: "pendiente",
          createdAt: o.date,
        });
      }
    }
  }

  for (const c of customers) {
    if (c.creditLimit > 0 && c.balancePending > c.creditLimit) {
      out.push({
        id: `alert-credito-${c.id}`,
        title: "Cliente sobre límite de crédito",
        detail: `${c.businessName}: pendiente $${c.balancePending.toFixed(2)} (límite $${c.creditLimit.toFixed(2)})`,
        severity: "alta",
        state: "pendiente",
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }
  }

  return out;
}
