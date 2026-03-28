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
import {
  adminAlertsSeed,
  adminAuditSeed,
  adminDeliveriesSeed,
  adminExpensesSeed,
  adminOrdersSeed,
  adminPaymentsSeed,
  adminPurchasesSeed,
  adminUsersSeed,
  dashboardKpisSeed,
} from "./mock-data";
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
import { apiFetchMe, apiLogin, getApiBaseUrl, networkErrorMessage, parseApiErrorMessage } from "@/lib/api";

const TOKEN_KEY = "ruta_admin_access_token";

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

function mapProductToAdmin(p: CatalogRow): AdminProduct {
  const tags = [
    ...(p.tags ?? []),
    ...(p.promo ? [String(p.promo)] : []),
    ...(p.combo ? [String(p.combo)] : []),
  ].filter(Boolean);
  return {
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl || "https://placehold.co/120x120/e2e8f0/64748b?text=Prod",
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

type AdminContextType = {
  authenticated: boolean;
  loading: boolean;
  /** null si éxito; mensaje de error si falla */
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  kpis: typeof dashboardKpisSeed;
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

export function AdminProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders] = useState(adminOrdersSeed);
  const [purchases] = useState(adminPurchasesSeed);
  const [deliveries] = useState(adminDeliveriesSeed);
  const [payments] = useState(adminPaymentsSeed);
  const [expenses] = useState(adminExpensesSeed);
  const [users] = useState(adminUsersSeed);
  const [audit] = useState(adminAuditSeed);
  const [alerts, setAlerts] = useState(adminAlertsSeed);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const user = await apiFetchMe(token);
        if (user.role !== "ADMIN") {
          window.localStorage.removeItem(TOKEN_KEY);
          setAuthenticated(false);
          return;
        }
        const data = await loadAdminCatalog(token);
        setProducts(data.products);
        setCustomers(data.customers);
        setAuthenticated(true);
      } catch {
        window.localStorage.removeItem(TOKEN_KEY);
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
      const data = await loadAdminCatalog(accessToken);
      setProducts(data.products);
      setCustomers(data.customers);
      window.localStorage.setItem(TOKEN_KEY, accessToken);
      setAuthenticated(true);
      return null;
    } catch (e) {
      return networkErrorMessage(e);
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setAuthenticated(false);
    setProducts([]);
    setCustomers([]);
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
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, state } : a)));
  }, []);

  const value = useMemo(
    () => ({
      authenticated,
      loading,
      login,
      logout,
      kpis: dashboardKpisSeed,
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
