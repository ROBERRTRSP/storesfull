"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { amountPendingOrder, buildPurchaseAggregates, orderSaleTotal } from "./aggregate";
import type {
  DriverCustomer,
  DriverIncident,
  DriverOrder,
  DriverOrderLine,
  DriverPayment,
  DriverPaymentSplit,
  DriverProfile,
  DriverReceipt,
  IncidentResolution,
  JornadaCierre,
  PaymentMethod,
  PurchaseAggregateRow,
  PurchaseLineStatus,
  RouteVisitStatus,
} from "./types";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth/constants";
import { apiFetchMe, apiLogin, apiLogout, getApiBaseUrl, networkErrorMessage, parseApiErrorMessage } from "@/lib/api";
import { patchOrderDeliveryOutcome, postStaffPayment } from "@/lib/driver-api";
import {
  paymentMethodToApiString,
  staffOrdersToDriverCustomers,
  staffOrdersToDriverOrders,
  staffPaymentsToDriverPayments,
  type StaffOrderListRow,
  type StaffPaymentListRow,
} from "@/lib/driver-map";

const emptyDriverProfile = (): DriverProfile => ({
  name: "",
  email: "",
  phone: "",
  vehicleLabel: "",
});

type ConductorContextType = {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  profile: DriverProfile;
  today: string;
  customers: DriverCustomer[];
  orders: DriverOrder[];
  routeVisitStatus: Record<string, RouteVisitStatus>;
  payments: DriverPayment[];
  receipts: DriverReceipt[];
  incidents: DriverIncident[];
  jornadaHistory: JornadaCierre[];
  jornadaCerrada: boolean;
  finalJornadaNote: string;
  purchaseAggregates: PurchaseAggregateRow[];
  dashboardStats: {
    pedidosHoy: number;
    clientesRuta: number;
    productosCompraPendiente: number;
    productosCompraListos: number;
    entregasCompletas: number;
    entregasParciales: number;
    entregasNoCompletas: number;
    totalCobrado: number;
    totalPendienteCobro: number;
    incidenciasHoy: number;
  };
  getCustomer: (id: string) => DriverCustomer | undefined;
  getOrdersForCustomer: (customerId: string) => DriverOrder[];
  getOrder: (id: string) => DriverOrder | undefined;
  getAggregateRow: (productId: string) => PurchaseAggregateRow | undefined;
  updatePurchaseForProduct: (
    productId: string,
    patch: {
      purchaseStatus?: PurchaseLineStatus;
      supplier?: string;
      purchaseNote?: string;
      unitCostReal?: number;
      substitutionProductName?: string;
      receiptPhotoDataUrl?: string | null;
    },
  ) => void;
  setProductPurchasedQtyTotal: (productId: string, qtyTotal: number) => void;
  updateOrderLinePurchase: (orderId: string, productId: string, patch: Partial<DriverOrderLine>) => void;
  updateOrderLineDelivery: (
    orderId: string,
    productId: string,
    patch: Partial<Pick<DriverOrderLine, "qtyDelivered" | "deliveryStatus" | "deliveryNote" | "substitutionProductName">>,
  ) => void;
  setRouteVisitStatus: (customerId: string, status: RouteVisitStatus) => void;
  confirmAllDeliveredForCustomer: (customerId: string) => void;
  syncOrderStatusFromLines: (orderId: string) => void;
  refreshOperational: () => Promise<void>;
  applyPayment: (input: {
    customerId: string;
    orderIds: string[];
    amount: number;
    splits: DriverPaymentSplit[];
    note?: string;
  }) => Promise<string | null>;
  generateReceiptForPayment: (paymentId: string) => DriverReceipt | null;
  addIncident: (input: {
    type: DriverIncident["type"];
    description: string;
    customerId?: string;
    orderId?: string;
    resolution?: IncidentResolution;
  }) => void;
  updateIncidentResolution: (id: string, resolution: IncidentResolution) => void;
  closeJornada: (note?: string) => void;
};

const ConductorContext = createContext<ConductorContextType | null>(null);

function uid() {
  return `d_${Math.random().toString(36).slice(2, 10)}`;
}

function distributePurchaseQty(orders: DriverOrder[], productId: string, qtyTotal: number): DriverOrder[] {
  const refs: { oi: number; li: number; qtyOrdered: number }[] = [];
  orders.forEach((o, oi) => {
    o.lines.forEach((l, li) => {
      if (l.productId === productId) refs.push({ oi, li, qtyOrdered: l.qtyOrdered });
    });
  });
  let left = qtyTotal;
  const next = orders.map((o) => ({ ...o, lines: o.lines.map((l) => ({ ...l })) }));
  for (const r of refs) {
    const take = Math.min(r.qtyOrdered, left);
    const line = next[r.oi].lines[r.li];
    line.qtyPurchased = take;
    left -= take;
    if (take >= r.qtyOrdered) line.purchaseStatus = "comprado";
    else if (take > 0) line.purchaseStatus = "parcial";
    else line.purchaseStatus = line.purchaseStatus === "no_encontrado" ? "no_encontrado" : "pendiente";
  }
  return next;
}

function recomputeOrderPurchaseMeta(o: DriverOrder): DriverOrder {
  const allBought = o.lines.every((l) => l.purchaseStatus === "comprado");
  const anyMissing = o.lines.some((l) => l.purchaseStatus === "no_encontrado");
  const anyPartial = o.lines.some((l) => l.purchaseStatus === "parcial" || l.qtyPurchased < l.qtyOrdered);
  let status = o.status;
  if (o.status === "entregado" || o.status === "no_entregado") return o;
  if (anyMissing || anyPartial) status = "confirmado";
  else if (allBought) status = "listo_ruta";
  return { ...o, status };
}

function recomputeOrderDeliveryMeta(o: DriverOrder): DriverOrder {
  const allDel = o.lines.every((l) => l.deliveryStatus === "entregado");
  const noneDel = o.lines.every((l) => l.deliveryStatus === "pendiente" || l.deliveryStatus === "no_entregado");
  const anyPar = o.lines.some((l) => l.deliveryStatus === "parcial");
  const anyNo = o.lines.some((l) => l.deliveryStatus === "no_entregado");
  let status = o.status;
  if (allDel) status = "entregado";
  else if (anyPar || (o.lines.some((l) => l.deliveryStatus === "entregado") && (anyNo || anyPar))) status = "entrega_parcial";
  else if (noneDel && o.lines.some((l) => l.deliveryStatus === "no_entregado")) status = "no_entregado";
  return { ...o, status };
}

export function ConductorProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<DriverProfile>(emptyDriverProfile);
  const [customers, setCustomers] = useState<DriverCustomer[]>([]);
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [routeVisitStatus, setRouteVisitStatusState] = useState<Record<string, RouteVisitStatus>>({});
  const [payments, setPayments] = useState<DriverPayment[]>([]);
  const [receipts, setReceipts] = useState<DriverReceipt[]>([]);
  const [incidents, setIncidents] = useState<DriverIncident[]>([]);
  const [jornadaHistory, setJornadaHistory] = useState<JornadaCierre[]>([]);
  const [jornadaCerrada, setJornadaCerrada] = useState(false);
  const [finalJornadaNote, setFinalJornadaNote] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const loadOperational = useCallback(async (accessToken: string, userFullName: string) => {
    const base = getApiBaseUrl();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const [orRes, payRes] = await Promise.all([
      fetch(`${base}/staff/orders`, { headers, credentials: "include" }),
      fetch(`${base}/staff/payments`, { headers, credentials: "include" }),
    ]);
    if (!orRes.ok) throw new Error(await parseApiErrorMessage(orRes));
    if (!payRes.ok) throw new Error(await parseApiErrorMessage(payRes));
    const orderRows = (await orRes.json()) as StaffOrderListRow[];
    const payRows = (await payRes.json()) as StaffPaymentListRow[];
    setOrders(staffOrdersToDriverOrders(orderRows));
    setCustomers(staffOrdersToDriverCustomers(orderRows));
    setPayments(staffPaymentsToDriverPayments(payRows, userFullName));
  }, []);

  const refreshOperational = useCallback(async () => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) return;
    try {
      const user = await apiFetchMe(token);
      await loadOperational(token, user.fullName);
    } catch {
      /* ignore */
    }
  }, [loadOperational]);

  useEffect(() => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const user = await apiFetchMe(token);
        if (user.role !== "DELIVERY") {
          window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          setAuthenticated(false);
          return;
        }
        setProfile({
          name: user.fullName,
          email: user.email,
          phone: "",
          vehicleLabel: "",
        });
        await loadOperational(token, user.fullName);
        setAuthenticated(true);
      } catch {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadOperational]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!email?.trim() || !password) return "Introduce email y contraseña";
      try {
        const { accessToken, user } = await apiLogin(email.trim(), password);
        if (user.role !== "DELIVERY") {
          return "Esta cuenta no es de conductor / reparto.";
        }
        setProfile({
          name: user.fullName,
          email: user.email,
          phone: "",
          vehicleLabel: "",
        });
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
        try {
          await loadOperational(accessToken, user.fullName);
        } catch (e) {
          window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          setProfile(emptyDriverProfile());
          return networkErrorMessage(e);
        }
        setAuthenticated(true);
        return null;
      } catch (e) {
        return networkErrorMessage(e);
      }
    },
    [loadOperational],
  );

  const logout = useCallback(() => {
    void apiLogout();
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setAuthenticated(false);
    setProfile(emptyDriverProfile());
    setCustomers([]);
    setOrders([]);
    setPayments([]);
    setReceipts([]);
    setRouteVisitStatusState({});
    setIncidents([]);
    setJornadaHistory([]);
    setJornadaCerrada(false);
    setFinalJornadaNote("");
  }, []);

  const getCustomer = useCallback((id: string) => customers.find((c) => c.id === id), [customers]);
  const getOrdersForCustomer = useCallback(
    (customerId: string) => orders.filter((o) => o.customerId === customerId),
    [orders],
  );
  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const purchaseAggregates = useMemo(() => buildPurchaseAggregates(orders, customers), [orders, customers]);

  const getAggregateRow = useCallback(
    (productId: string) => purchaseAggregates.find((r) => r.productId === productId),
    [purchaseAggregates],
  );

  const updatePurchaseForProduct = useCallback(
    (
      productId: string,
      patch: {
        purchaseStatus?: PurchaseLineStatus;
        supplier?: string;
        purchaseNote?: string;
        unitCostReal?: number;
        substitutionProductName?: string;
        receiptPhotoDataUrl?: string | null;
      },
    ) => {
      setOrders((prev) => {
        const next = prev.map((o) => ({
          ...o,
          lines: o.lines.map((l) => {
            if (l.productId !== productId) return l;
            const u: DriverOrderLine = { ...l };
            if (patch.purchaseStatus !== undefined) {
              u.purchaseStatus = patch.purchaseStatus;
              if (patch.purchaseStatus === "comprado") u.qtyPurchased = l.qtyOrdered;
              if (patch.purchaseStatus === "no_encontrado") u.qtyPurchased = 0;
            }
            if (patch.supplier !== undefined) u.supplier = patch.supplier;
            if (patch.purchaseNote !== undefined) u.purchaseNote = patch.purchaseNote;
            if (patch.unitCostReal !== undefined) u.unitCostReal = patch.unitCostReal;
            if (patch.substitutionProductName !== undefined) u.substitutionProductName = patch.substitutionProductName;
            if (patch.receiptPhotoDataUrl !== undefined) u.receiptPhotoDataUrl = patch.receiptPhotoDataUrl ?? undefined;
            return u;
          }),
        }));
        return next.map(recomputeOrderPurchaseMeta);
      });
    },
    [],
  );

  const setProductPurchasedQtyTotal = useCallback((productId: string, qtyTotal: number) => {
    setOrders((prev) => {
      const distributed = distributePurchaseQty(prev, productId, qtyTotal);
      return distributed.map(recomputeOrderPurchaseMeta);
    });
  }, []);

  const updateOrderLinePurchase = useCallback((orderId: string, productId: string, patch: Partial<DriverOrderLine>) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return recomputeOrderPurchaseMeta({
          ...o,
          lines: o.lines.map((l) => (l.productId === productId ? { ...l, ...patch } : l)),
        });
      }),
    );
  }, []);

  const updateOrderLineDelivery = useCallback(
    (
      orderId: string,
      productId: string,
      patch: Partial<Pick<DriverOrderLine, "qtyDelivered" | "deliveryStatus" | "deliveryNote" | "substitutionProductName">>,
    ) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return recomputeOrderDeliveryMeta({
            ...o,
            lines: o.lines.map((l) => (l.productId === productId ? { ...l, ...patch } : l)),
          });
        }),
      );
    },
    [],
  );

  const setRouteVisitStatus = useCallback((customerId: string, status: RouteVisitStatus) => {
    setRouteVisitStatusState((s) => ({ ...s, [customerId]: status }));
  }, []);

  const confirmAllDeliveredForCustomer = useCallback(
    (customerId: string) => {
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      setOrders((prev) => {
        const updated = prev.map((o) => {
          if (o.customerId !== customerId) return o;
          return recomputeOrderDeliveryMeta({
            ...o,
            lines: o.lines.map((l) => ({
              ...l,
              qtyDelivered: l.qtyPurchased,
              deliveryStatus: l.qtyPurchased > 0 ? ("entregado" as const) : ("no_entregado" as const),
            })),
          });
        });
        if (token) {
          void (async () => {
            for (const o of updated) {
              if (o.customerId !== customerId) continue;
              if (o.status === "entregado") {
                const r = await patchOrderDeliveryOutcome(token, o.id, "entregado");
                if (!r.ok) console.error(r.error);
              } else if (o.status === "entrega_parcial") {
                const r = await patchOrderDeliveryOutcome(token, o.id, "parcial");
                if (!r.ok) console.error(r.error);
              }
            }
            await refreshOperational();
          })();
        }
        return updated;
      });
    },
    [refreshOperational],
  );

  const syncOrderStatusFromLines = useCallback((orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? recomputeOrderDeliveryMeta(recomputeOrderPurchaseMeta(o)) : o)));
  }, []);

  /** Reparto proporcional al saldo pendiente de cada pedido; persiste vía API. */
  const applyPaymentProportional = useCallback(
    async (input: {
      customerId: string;
      orderIds: string[];
      amount: number;
      splits: DriverPaymentSplit[];
      note?: string;
    }): Promise<string | null> => {
      const sumSplits = input.splits.reduce((s, x) => s + x.amount, 0);
      if (input.orderIds.length === 0 || input.amount <= 0 || Math.abs(sumSplits - input.amount) > 0.02) {
        return null;
      }
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token) return null;

      const targets = orders.filter((o) => input.orderIds.includes(o.id));
      const pendingByOrder = Object.fromEntries(targets.map((o) => [o.id, amountPendingOrder(o)]));
      const totalPending = Object.values(pendingByOrder).reduce((a, b) => a + b, 0);
      if (totalPending <= 0) return null;

      const round2 = (n: number) => Math.round(n * 100) / 100;
      let firstPaymentId: string | null = null;

      for (const oid of input.orderIds) {
        const pend = pendingByOrder[oid] ?? 0;
        if (pend <= 0) continue;
        const target = Math.min(pend, round2((input.amount * pend) / totalPending));
        if (target < 0.01) continue;
        let assigned = 0;
        for (let i = 0; i < input.splits.length; i++) {
          const sp = input.splits[i];
          const isLast = i === input.splits.length - 1;
          const part = isLast ? round2(target - assigned) : round2(target * (sp.amount / input.amount));
          if (part < 0.01) continue;
          const r = await postStaffPayment(token, {
            orderId: oid,
            amount: part,
            method: paymentMethodToApiString(sp.method),
            notes: input.note,
          });
          if (!r.ok) {
            console.error(r.error);
            await refreshOperational();
            return null;
          }
          if (r.id && !firstPaymentId) firstPaymentId = r.id;
          assigned += part;
        }
      }

      await refreshOperational();
      return firstPaymentId;
    },
    [orders, refreshOperational],
  );

  const generateReceiptForPayment = useCallback(
    (paymentId: string): DriverReceipt | null => {
      const pay = payments.find((p) => p.id === paymentId);
      if (!pay) return null;
      const existing = receipts.find((r) => r.paymentId === paymentId);
      if (existing) return existing;
      const related = orders.filter((o) => pay.orderIds.includes(o.id));
      const summaryLines: DriverReceipt["summaryLines"] = [];
      for (const o of related) {
        for (const l of o.lines) {
          if (l.qtyDelivered <= 0) continue;
          summaryLines.push({
            productName: l.substitutionProductName ?? l.productName,
            qty: l.qtyDelivered,
            subtotal: l.qtyDelivered * l.unitSalePrice,
          });
        }
      }
      const totalSale = related.reduce((s, o) => s + orderSaleTotal(o), 0);
      const pendingAfter = related.reduce((s, o) => s + amountPendingOrder(o), 0);
      const methodsLabel = pay.splits.map((s) => `${s.method}:${s.amount.toFixed(2)}`).join(" · ");
      const rec: DriverReceipt = {
        id: uid(),
        createdAt: pay.at,
        customerId: pay.customerId,
        paymentId: pay.id,
        orderIds: pay.orderIds,
        summaryLines,
        totalSale,
        amountPaid: pay.amount,
        amountPending: Math.max(0, pendingAfter),
        methodsLabel,
      };
      setReceipts((r) => [...r, rec]);
      return rec;
    },
    [orders, payments, receipts],
  );

  const addIncident = useCallback(
    (input: {
      type: DriverIncident["type"];
      description: string;
      customerId?: string;
      orderId?: string;
      resolution?: IncidentResolution;
    }) => {
      const at = new Date().toISOString();
      setIncidents((i) => [
        ...i,
        {
          id: uid(),
          at,
          type: input.type,
          description: input.description,
          customerId: input.customerId,
          orderId: input.orderId,
          resolution: input.resolution ?? "abierta",
          recordedBy: profile.name,
        },
      ]);
    },
    [profile.name],
  );

  const updateIncidentResolution = useCallback((id: string, resolution: IncidentResolution) => {
    setIncidents((list) => list.map((x) => (x.id === id ? { ...x, resolution } : x)));
  }, []);

  const closeJornada = useCallback(
    (note?: string) => {
      const pedidosHoy = orders.length;
      const entregados = orders.filter((o) => o.status === "entregado").length;
      const parciales = orders.filter((o) => o.status === "entrega_parcial").length;
      const noEnt = orders.filter((o) => o.status === "no_entregado").length;
      const totalVenta = orders.reduce((s, o) => s + orderSaleTotal(o), 0);
      const totalCompraReal = orders.reduce(
        (s, o) => s + o.lines.reduce((a, l) => a + (l.unitCostReal ?? 0) * l.qtyPurchased, 0),
        0,
      );
      const totalCobrado = payments.reduce((s, p) => s + p.amount, 0);
      const cobradoEfectivo = payments.reduce(
        (s, p) => s + p.splits.filter((x) => x.method === "efectivo").reduce((a, x) => a + x.amount, 0),
        0,
      );
      const cobradoDigital = payments.reduce(
        (s, p) =>
          s +
          p.splits
            .filter((x) => x.method === "zelle" || x.method === "transferencia" || x.method === "cash_app" || x.method === "otro")
            .reduce((a, x) => a + x.amount, 0),
        0,
      );
      const totalPendiente = orders.reduce((s, o) => s + amountPendingOrder(o), 0);
      const incCount = incidents.filter((i) => i.at.startsWith(today)).length;
      const cierre: JornadaCierre = {
        id: uid(),
        date: today,
        closedAt: new Date().toISOString(),
        note,
        stats: {
          pedidosAsignados: pedidosHoy,
          pedidosEntregados: entregados,
          pedidosParciales: parciales,
          pedidosNoEntregados: noEnt,
          totalVenta,
          totalCompraReal,
          totalCobrado,
          cobradoEfectivo,
          cobradoDigital,
          totalPendiente,
          incidencias: incCount,
        },
      };
      setJornadaHistory((h) => [cierre, ...h]);
      setJornadaCerrada(true);
      setFinalJornadaNote(note ?? "");
    },
    [orders, payments, incidents, today],
  );

  const dashboardStats = useMemo(() => {
    const productosCompraPendiente = purchaseAggregates.filter(
      (r) => r.purchaseStatus === "pendiente" || r.purchaseStatus === "parcial" || r.qtyPending > 0,
    ).length;
    const productosCompraListos = purchaseAggregates.filter((r) => r.purchaseStatus === "comprado" && r.qtyPending <= 0).length;
    const entregasCompletas = orders.filter((o) => o.status === "entregado").length;
    const entregasParciales = orders.filter((o) => o.status === "entrega_parcial").length;
    const entregasNoCompletas = orders.filter((o) => o.status === "no_entregado").length;
    const totalCobrado = payments.reduce((s, p) => s + p.amount, 0);
    const totalPendienteCobro = orders.reduce((s, o) => s + amountPendingOrder(o), 0);
    const clientesRuta = new Set(orders.map((o) => o.customerId)).size;
    return {
      pedidosHoy: orders.length,
      clientesRuta,
      productosCompraPendiente,
      productosCompraListos,
      entregasCompletas,
      entregasParciales,
      entregasNoCompletas,
      totalCobrado,
      totalPendienteCobro,
      incidenciasHoy: incidents.filter((i) => i.at.startsWith(today)).length,
    };
  }, [orders, payments, purchaseAggregates, incidents, today]);

  const value: ConductorContextType = {
    authenticated,
    loading,
    login,
    logout,
    profile,
    today,
    customers,
    orders,
    routeVisitStatus,
    payments,
    receipts,
    incidents,
    jornadaHistory,
    jornadaCerrada,
    finalJornadaNote,
    purchaseAggregates,
    dashboardStats,
    getCustomer,
    getOrdersForCustomer,
    getOrder,
    getAggregateRow,
    updatePurchaseForProduct,
    setProductPurchasedQtyTotal,
    updateOrderLinePurchase,
    updateOrderLineDelivery,
    setRouteVisitStatus,
    confirmAllDeliveredForCustomer,
    syncOrderStatusFromLines,
    refreshOperational,
    applyPayment: applyPaymentProportional,
    generateReceiptForPayment,
    addIncident,
    updateIncidentResolution,
    closeJornada,
  };

  return <ConductorContext.Provider value={value}>{children}</ConductorContext.Provider>;
}

export function useConductor() {
  const ctx = useContext(ConductorContext);
  if (!ctx) throw new Error("useConductor dentro de ConductorProvider");
  return ctx;
}
