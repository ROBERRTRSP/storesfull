import type { DriverOrder, PurchaseAggregateRow, PurchaseLineStatus } from "./types";

const statusRank: Record<PurchaseLineStatus, number> = {
  no_encontrado: 5,
  pendiente: 4,
  parcial: 3,
  sustituido: 2,
  comprado: 0,
};

function mergePurchaseStatus(a: PurchaseLineStatus, b: PurchaseLineStatus): PurchaseLineStatus {
  return statusRank[a] >= statusRank[b] ? a : b;
}

export function buildPurchaseAggregates(orders: DriverOrder[], customers: { id: string; businessName: string }[]): PurchaseAggregateRow[] {
  const map = new Map<
    string,
    {
      productName: string;
      qtyRequired: number;
      qtyPurchased: number;
      costEstimateTotal: number;
      costRealTotal: number;
      supplier?: string;
      orderIds: Set<string>;
      customerIds: Set<string>;
      status: PurchaseLineStatus;
    }
  >();

  const nameByCustomer = Object.fromEntries(customers.map((c) => [c.id, c.businessName]));

  for (const o of orders) {
    for (const l of o.lines) {
      const cur = map.get(l.productId);
      const lineCostEst = l.qtyOrdered * l.unitCostEstimate;
      const lineCostReal = (l.unitCostReal ?? 0) * l.qtyPurchased;
      if (!cur) {
        map.set(l.productId, {
          productName: l.productName,
          qtyRequired: l.qtyOrdered,
          qtyPurchased: l.qtyPurchased,
          costEstimateTotal: lineCostEst,
          costRealTotal: lineCostReal,
          supplier: l.supplier,
          orderIds: new Set([o.id]),
          customerIds: new Set([o.customerId]),
          status: l.purchaseStatus,
        });
      } else {
        cur.productName = l.productName;
        cur.qtyRequired += l.qtyOrdered;
        cur.qtyPurchased += l.qtyPurchased;
        cur.costEstimateTotal += lineCostEst;
        cur.costRealTotal += lineCostReal;
        cur.supplier = cur.supplier || l.supplier;
        cur.orderIds.add(o.id);
        cur.customerIds.add(o.customerId);
        cur.status = mergePurchaseStatus(cur.status, l.purchaseStatus);
      }
    }
  }

  return Array.from(map.entries()).map(([productId, v]) => ({
    productId,
    productName: v.productName,
    qtyRequired: v.qtyRequired,
    qtyPurchased: v.qtyPurchased,
    qtyPending: Math.max(0, v.qtyRequired - v.qtyPurchased),
    purchaseStatus: v.status,
    costEstimateTotal: v.costEstimateTotal,
    costRealTotal: v.costRealTotal,
    supplier: v.supplier,
    orderIds: Array.from(v.orderIds),
    customerIds: Array.from(v.customerIds),
    customerNames: Array.from(v.customerIds).map((id) => nameByCustomer[id] ?? id),
  }));
}

export function orderSaleTotal(o: DriverOrder): number {
  return o.lines.reduce((s, l) => s + l.qtyOrdered * l.unitSalePrice, 0);
}

export function orderDeliveredTotal(o: DriverOrder): number {
  return o.lines.reduce((s, l) => s + l.qtyDelivered * l.unitSalePrice, 0);
}

export function amountPendingOrder(o: DriverOrder): number {
  return Math.max(0, orderSaleTotal(o) - o.amountPaid);
}
