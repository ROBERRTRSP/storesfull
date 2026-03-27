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
  adminCustomersSeed,
  adminDeliveriesSeed,
  adminExpensesSeed,
  adminOrdersSeed,
  adminPaymentsSeed,
  adminProductsSeed,
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

const SESSION_KEY = "ruta_admin_session";

type AdminContextType = {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => boolean;
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

export function AdminProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [customers] = useState(adminCustomersSeed);
  const [products] = useState(adminProductsSeed);
  const [orders] = useState(adminOrdersSeed);
  const [purchases] = useState(adminPurchasesSeed);
  const [deliveries] = useState(adminDeliveriesSeed);
  const [payments] = useState(adminPaymentsSeed);
  const [expenses] = useState(adminExpensesSeed);
  const [users] = useState(adminUsersSeed);
  const [audit] = useState(adminAuditSeed);
  const [alerts, setAlerts] = useState(adminAlertsSeed);

  useEffect(() => {
    const s = window.localStorage.getItem(SESSION_KEY);
    setAuthenticated(s === "1");
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    if (!email?.trim() || !password) return false;
    const ok = email.trim().toLowerCase() === "admin@demo.local" && password === "Admin1234";
    if (!ok) return false;
    window.localStorage.setItem(SESSION_KEY, "1");
    setAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
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
