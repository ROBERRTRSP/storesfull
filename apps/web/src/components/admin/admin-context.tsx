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
  AlertState,
} from "./types";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth/constants";
import {
  apiFetchMe,
  apiLogin,
  apiLogout,
  getApiBaseUrl,
  networkErrorMessage,
  parseApiErrorMessage,
} from "@/lib/api";
import { deriveAdminAlerts, deriveAdminKpis, type AdminKpis } from "@/lib/admin-kpis";

type CatalogRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  promo?: string | null;
  combo?: string | null;
  sku?: string;
  imageUrl?: string | null;
  referenceCost?: number;
  isActive?: boolean;
  tags?: string[];
};

type CustomerRow = {
  id: string;
  businessName: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  zone?: string | null;
  visitDay?: string | null;
  creditLimit?: unknown;
  status?: string;
};

type StaffOrderRow = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  createdBy: string;
  sellerName: string;
  date: string;
  total: number;
  status: AdminOrder["status"];
};

type StaffPaymentRow = {
  id: string;
  date: string;
  customerName: string;
  amount: number;
  method: string;
  orderRef?: string;
  recordedBy: string;
};

function mapProductToAdmin(p: CatalogRow): AdminProduct {
  const tags = [
    ...(p.tags ?? []),
    ...(p.promo ? [String(p.promo)] : []),
    ...(p.combo ? [String(p.combo)] : []),
  ].filter(Boolean);
  return {
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl?.trim() ? p.imageUrl : "",
    department: p.category,
    category: p.category,
    sku: String(p.sku ?? p.id),
    unit: p.unit,
    salePrice: p.price,
    refCost: Number(p.referenceCost ?? 0),
    active: p.isActive !== false,
    tags,
  };
}

function mapCustomerToAdmin(c: CustomerRow): AdminCustomer {
  return {
    id: c.id,
    businessName: c.businessName,
    contactName: c.contactName ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    zone: c.zone ?? "",
    visitDay: c.visitDay ?? "",
    sellerName: "—",
    active: c.status !== "INACTIVE",
    creditLimit: Number(c.creditLimit ?? 0),
    balancePending: 0,
    lastPurchase: null,
  };
}

type CustomerMetricPayload = {
  customerId: string;
  balancePending: number;
  lastPurchase: string | null;
  sellerName: string;
};

function mergeCustomerMetrics(customers: AdminCustomer[], metrics: CustomerMetricPayload[]): AdminCustomer[] {
  const m = new Map(metrics.map((x) => [x.customerId, x]));
  return customers.map((c) => {
    const mm = m.get(c.id);
    if (!mm) return c;
    return {
      ...c,
      balancePending: mm.balancePending,
      lastPurchase: mm.lastPurchase,
      sellerName: mm.sellerName || c.sellerName,
    };
  });
}

type AdminSnapshotResponse = {
  kpis: AdminKpis;
  customerMetrics: CustomerMetricPayload[];
  purchases: AdminPurchase[];
  deliveries: AdminDelivery[];
  expenses: AdminExpense[];
  users: AdminUser[];
  audit: AdminAuditEntry[];
};

async function loadAdminSnapshot(token: string): Promise<AdminSnapshotResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/admin/snapshot`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return res.json() as Promise<AdminSnapshotResponse>;
}

function mapStaffOrderRow(row: StaffOrderRow): AdminOrder {
  return {
    id: row.id,
    number: row.number,
    customerId: row.customerId,
    customerName: row.customerName,
    createdBy: row.createdBy,
    sellerName: row.sellerName,
    date: row.date,
    total: row.total,
    status: row.status,
  };
}

function mapStaffPaymentRow(p: StaffPaymentRow): AdminPayment {
  return {
    id: p.id,
    date: p.date,
    customerName: p.customerName,
    amount: p.amount,
    method: p.method,
    orderRef: p.orderRef,
    recordedBy: p.recordedBy,
  };
}

async function loadAdminCatalog(token: string): Promise<{ products: AdminProduct[]; customers: AdminCustomer[] }> {
  const base = getApiBaseUrl();
  const headers = { Authorization: `Bearer ${token}` };
  const [prRes, cuRes] = await Promise.all([
    fetch(`${base}/products`, { headers }),
    fetch(`${base}/customers`, { headers }),
  ]);
  if (!prRes.ok) throw new Error(await parseApiErrorMessage(prRes));
  if (!cuRes.ok) throw new Error(await parseApiErrorMessage(cuRes));
  const productsJson = (await prRes.json()) as CatalogRow[];
  const customersJson = (await cuRes.json()) as CustomerRow[];
  return {
    products: productsJson.map(mapProductToAdmin),
    customers: customersJson.map(mapCustomerToAdmin),
  };
}

async function loadStaffOperational(token: string): Promise<{
  orders: AdminOrder[];
  payments: AdminPayment[];
}> {
  const base = getApiBaseUrl();
  const headers = { Authorization: `Bearer ${token}` };
  const [orRes, payRes] = await Promise.all([
    fetch(`${base}/staff/orders`, { headers }),
    fetch(`${base}/staff/payments`, { headers }),
  ]);
  if (!orRes.ok) throw new Error(await parseApiErrorMessage(orRes));
  if (!payRes.ok) throw new Error(await parseApiErrorMessage(payRes));
  const orderRows = (await orRes.json()) as StaffOrderRow[];
  const payRows = (await payRes.json()) as StaffPaymentRow[];
  return {
    orders: orderRows.map(mapStaffOrderRow),
    payments: payRows.map(mapStaffPaymentRow),
  };
}

type AdminContextType = {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  staffFetch: (path: string, init?: RequestInit) => Promise<Response>;
  refreshOperational: () => Promise<void>;
  kpis: AdminKpis;
  customers: AdminCustomer[];
  products: AdminProduct[];
  orders: AdminOrder[];
  purchases: AdminPurchase[];
  deliveries: AdminDelivery[];
  payments: AdminPayment[];
  expenses: AdminExpense[];
  users: AdminUser[];
  audit: AdminAuditEntry[];
  alerts: AdminAlert[];
  setAlertState: (id: string, state: AlertState) => void;
  getCustomer: (id: string) => AdminCustomer | undefined;
  getOrdersForCustomer: (customerId: string) => AdminOrder[];
  getOrder: (id: string) => AdminOrder | undefined;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [expenses, setExpenses] = useState<AdminExpense[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [audit, setAudit] = useState<AdminAuditEntry[]>([]);
  const [kpis, setKpis] = useState<AdminKpis>(() => deriveAdminKpis([], [], []));
  const [alertOverrides, setAlertOverrides] = useState<Record<string, AlertState>>({});

  const generatedAlerts = useMemo(() => deriveAdminAlerts(orders, customers), [orders, customers]);
  const alerts = useMemo(
    () => generatedAlerts.map((a) => ({ ...a, state: alertOverrides[a.id] ?? a.state })),
    [generatedAlerts, alertOverrides],
  );

  const staffFetch = useCallback(async (path: string, init?: RequestInit) => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) throw new Error("Sin sesión");
    const base = getApiBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init?.body && typeof init.body === "string" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(url, { ...init, headers });
  }, []);

  const refreshOperational = useCallback(async () => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) return;
    try {
      const [op, snap] = await Promise.all([loadStaffOperational(token), loadAdminSnapshot(token)]);
      setOrders(op.orders);
      setPayments(op.payments);
      setKpis(snap.kpis);
      setPurchases(snap.purchases);
      setDeliveries(snap.deliveries);
      setExpenses(snap.expenses);
      setUsers(snap.users);
      setAudit(snap.audit);
      setCustomers((prev) => mergeCustomerMetrics(prev, snap.customerMetrics));
    } catch {
      /* mantener datos previos */
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const user = await apiFetchMe(token);
        if (user.role !== "ADMIN") {
          window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          setAuthenticated(false);
          return;
        }
        const [data, op, snap] = await Promise.all([
          loadAdminCatalog(token),
          loadStaffOperational(token),
          loadAdminSnapshot(token),
        ]);
        setProducts(data.products);
        setCustomers(mergeCustomerMetrics(data.customers, snap.customerMetrics));
        setOrders(op.orders);
        setPayments(op.payments);
        setKpis(snap.kpis);
        setPurchases(snap.purchases);
        setDeliveries(snap.deliveries);
        setExpenses(snap.expenses);
        setUsers(snap.users);
        setAudit(snap.audit);
        setAuthenticated(true);
      } catch {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!email?.trim() || !password) return "Introduce email y contraseña";
    try {
      const { accessToken, user } = await apiLogin(email.trim(), password);
      if (user.role !== "ADMIN") {
        return "Esta cuenta no es de administrador.";
      }
      const [data, op, snap] = await Promise.all([
        loadAdminCatalog(accessToken),
        loadStaffOperational(accessToken),
        loadAdminSnapshot(accessToken),
      ]);
      setProducts(data.products);
      setCustomers(mergeCustomerMetrics(data.customers, snap.customerMetrics));
      setOrders(op.orders);
      setPayments(op.payments);
      setKpis(snap.kpis);
      setPurchases(snap.purchases);
      setDeliveries(snap.deliveries);
      setExpenses(snap.expenses);
      setUsers(snap.users);
      setAudit(snap.audit);
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
      setAuthenticated(true);
      return null;
    } catch (e) {
      return networkErrorMessage(e);
    }
  }, []);

  const logout = useCallback(() => {
    void apiLogout();
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setAuthenticated(false);
    setProducts([]);
    setCustomers([]);
    setOrders([]);
    setPayments([]);
    setPurchases([]);
    setDeliveries([]);
    setExpenses([]);
    setUsers([]);
    setAudit([]);
    setKpis(deriveAdminKpis([], [], []));
    setAlertOverrides({});
  }, []);

  const getCustomer = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers],
  );

  const getOrdersForCustomer = useCallback(
    (customerId: string) =>
      orders.filter((o) => o.customerId === customerId).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [orders],
  );

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const setAlertState = useCallback((id: string, state: AlertState) => {
    setAlertOverrides((prev) => ({ ...prev, [id]: state }));
  }, []);

  const value = useMemo(
    () => ({
      authenticated,
      loading,
      login,
      logout,
      staffFetch,
      refreshOperational,
      kpis,
      customers,
      products,
      orders,
      purchases,
      deliveries,
      payments,
      expenses,
      users,
      audit,
      alerts,
      setAlertState,
      getCustomer,
      getOrdersForCustomer,
      getOrder,
    }),
    [
      authenticated,
      loading,
      login,
      logout,
      staffFetch,
      refreshOperational,
      kpis,
      customers,
      products,
      orders,
      purchases,
      deliveries,
      payments,
      expenses,
      users,
      audit,
      alerts,
      setAlertState,
      getCustomer,
      getOrdersForCustomer,
      getOrder,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
