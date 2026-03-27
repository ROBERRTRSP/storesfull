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
  catalogSeed,
  customersSeed,
  followUpsSeed,
  offersSeed,
  opportunitiesSeed,
  ordersSeed,
  sellerProfileSeed,
  visitsTodaySeed,
} from "./mock-data";
import type {
  CatalogProduct,
  FollowUpStatus,
  SellerCustomer,
  SellerFollowUp,
  SellerOffer,
  SellerOpportunity,
  SellerOrder,
  SellerOrderLine,
  SellerProfile,
  SellerVisit,
  VisitStatus,
} from "./types";

const SESSION_KEY = "ruta_seller_session";

type SellerContextType = {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  profile: SellerProfile;
  customers: SellerCustomer[];
  orders: SellerOrder[];
  visitsToday: SellerVisit[];
  followUps: SellerFollowUp[];
  catalog: CatalogProduct[];
  getCustomer: (id: string) => SellerCustomer | undefined;
  getOrdersForCustomer: (customerId: string) => SellerOrder[];
  getDraftForCustomer: (customerId: string) => SellerOrder | undefined;
  getFrequentProductsForCustomer: (customerId: string) => { name: string; qty: number }[];
  updateVisitStatus: (visitId: string, status: VisitStatus, quickNote?: string) => void;
  addFollowUp: (customerId: string, text: string, status?: FollowUpStatus) => void;
  updateFollowUpStatus: (id: string, status: FollowUpStatus) => void;
  createOrUpdateDraft: (customerId: string, lines: SellerOrderLine[], note?: string) => SellerOrder;
  confirmOrder: (orderId: string) => void;
  repeatLastOrder: (customerId: string) => string | null;
  dashboardStats: {
    visitasPendientesHoy: number;
    visitasHechasHoy: number;
    pedidosCreadosHoy: number;
    pedidosConfirmadosHoy: number;
    ventasDia: number;
    ventasSemana: number;
    clientesSinCompra: number;
    oportunidadesAbiertas: number;
    seguimientosPendientes: number;
  };
  opportunities: SellerOpportunity[];
  offers: SellerOffer[];
};

const SellerContext = createContext<SellerContextType | null>(null);

function orderTotal(lines: SellerOrderLine[]) {
  return lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
}

export function SellerProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile] = useState(sellerProfileSeed);
  const [customers, setCustomers] = useState(customersSeed);
  const [orders, setOrders] = useState(ordersSeed);
  const [visitsToday, setVisitsToday] = useState(visitsTodaySeed);
  const [followUps, setFollowUps] = useState(followUpsSeed);
  const [opportunities] = useState(opportunitiesSeed);
  const [offers] = useState(offersSeed);

  useEffect(() => {
    const s = window.localStorage.getItem(SESSION_KEY);
    setAuthenticated(s === "1");
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    if (!email || !password) return;
    window.localStorage.setItem(SESSION_KEY, "1");
    setAuthenticated(true);
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
    (customerId: string) => orders.filter((o) => o.customerId === customerId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [orders],
  );

  const getDraftForCustomer = useCallback(
    (customerId: string) => orders.find((o) => o.customerId === customerId && o.status === "borrador"),
    [orders],
  );

  const getFrequentProductsForCustomer = useCallback(
    (customerId: string) => {
      const done = orders.filter((o) => o.customerId === customerId && o.status !== "borrador");
      const map = new Map<string, number>();
      for (const o of done) {
        for (const l of o.lines) {
          map.set(l.name, (map.get(l.name) ?? 0) + l.qty);
        }
      }
      return Array.from(map.entries())
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
    },
    [orders],
  );

  const updateVisitStatus = useCallback((visitId: string, status: VisitStatus, quickNote?: string) => {
    setVisitsToday((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, status, quickNote: quickNote ?? v.quickNote } : v)),
    );
  }, []);

  const addFollowUp = useCallback((customerId: string, text: string, status: FollowUpStatus = "pendiente") => {
    const id = `f-${Date.now()}`;
    const row: SellerFollowUp = {
      id,
      customerId,
      text,
      createdAt: new Date().toISOString().slice(0, 10),
      status,
    };
    setFollowUps((prev) => [row, ...prev]);
  }, []);

  const updateFollowUpStatus = useCallback((id: string, status: FollowUpStatus) => {
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  }, []);

  const createOrUpdateDraft = useCallback(
    (customerId: string, lines: SellerOrderLine[], note?: string) => {
      const existing = orders.find((o) => o.customerId === customerId && o.status === "borrador");
      const id = existing?.id ?? `o-${Date.now()}`;
      const row: SellerOrder = {
        id,
        customerId,
        status: "borrador",
        createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
        lines,
        note,
      };
      setOrders((prev) => {
        const without = prev.filter((o) => o.id !== id);
        return [row, ...without];
      });
      return row;
    },
    [orders],
  );

  const confirmOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "confirmado" } : o)));
  }, []);

  const repeatLastOrder = useCallback(
    (customerId: string) => {
      const list = orders
        .filter((o) => o.customerId === customerId && o.status !== "borrador")
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      const last = list[0];
      if (!last) return null;
      const id = `o-${Date.now()}`;
      const draft: SellerOrder = {
        id,
        customerId,
        status: "borrador",
        createdAt: new Date().toISOString().slice(0, 10),
        lines: last.lines.map((l) => ({ ...l })),
        note: `Repetido de pedido ${last.id}`,
      };
      setOrders((prev) => [draft, ...prev.filter((o) => !(o.customerId === customerId && o.status === "borrador"))]);
      return id;
    },
    [orders],
  );

  const today = new Date().toISOString().slice(0, 10);
  const dashboardStats = useMemo(() => {
    const visitasPendientesHoy = visitsToday.filter((v) => v.status === "pendiente").length;
    const visitasHechasHoy = visitsToday.filter((v) => v.status === "visitado" || v.status === "pedido_creado").length;
    const pedidosHoy = orders.filter((o) => o.createdAt === today);
    const pedidosCreadosHoy = pedidosHoy.length;
    const pedidosConfirmadosHoy = pedidosHoy.filter((o) => o.status === "confirmado").length;
    const ventasDia = orders
      .filter((o) => o.createdAt === today && o.status === "confirmado")
      .reduce((s, o) => s + orderTotal(o.lines), 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().slice(0, 10);
    const ventasSemana = orders
      .filter((o) => o.createdAt >= weekStr && o.status === "confirmado")
      .reduce((s, o) => s + orderTotal(o.lines), 0);
    const days14 = new Date();
    days14.setDate(days14.getDate() - 14);
    const clientesSinCompra = customers.filter((c) => {
      if (!c.lastPurchaseDate) return true;
      return c.lastPurchaseDate < days14.toISOString().slice(0, 10);
    }).length;
    return {
      visitasPendientesHoy,
      visitasHechasHoy,
      pedidosCreadosHoy,
      pedidosConfirmadosHoy,
      ventasDia,
      ventasSemana,
      clientesSinCompra,
      oportunidadesAbiertas: opportunities.length,
      seguimientosPendientes: followUps.filter((f) => f.status === "pendiente").length,
    };
  }, [visitsToday, orders, customers, followUps, opportunities, today]);

  const value: SellerContextType = {
    authenticated,
    loading,
    login,
    logout,
    profile,
    customers,
    orders,
    visitsToday,
    followUps,
    catalog: catalogSeed,
    getCustomer,
    getOrdersForCustomer,
    getDraftForCustomer,
    getFrequentProductsForCustomer,
    updateVisitStatus,
    addFollowUp,
    updateFollowUpStatus,
    createOrUpdateDraft,
    confirmOrder,
    repeatLastOrder,
    dashboardStats,
    opportunities,
    offers,
  };

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error("useSeller dentro de SellerProvider");
  return ctx;
}

export function waLink(phone: string, text?: string) {
  const n = phone.replace(/\D/g, "");
  const base = `https://wa.me/${n}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function telLink(phone: string) {
  const n = phone.replace(/\D/g, "");
  return `tel:${n}`;
}
