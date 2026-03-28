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
  CatalogProduct,
  FollowUpStatus,
  OrderStatusSeller,
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
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth/constants";
import { apiFetchMe, apiLogin, apiLogout, getApiBaseUrl, networkErrorMessage, parseApiErrorMessage } from "@/lib/api";

function sellerProfileFromUser(u: { fullName: string; email: string }): SellerProfile {
  return { name: u.fullName, email: u.email, phone: "", zoneLabel: "" };
}

const emptySellerProfile: SellerProfile = { name: "", email: "", phone: "", zoneLabel: "" };

type StaffOrderApiRow = {
  id: string;
  customerId: string;
  date: string;
  status: string;
  items: { productId: string; productName: string; qty: number; unitPrice: number }[];
  notes?: string | null;
};

function staffUiStatusToSeller(s: string): OrderStatusSeller {
  if (s === "borrador") return "borrador";
  if (s === "confirmado") return "confirmado";
  if (s === "cancelado") return "cancelado";
  if (["entregado", "parcial", "pendiente_pago", "pagado"].includes(s)) return "entregado";
  return "en_proceso";
}

function mapStaffListRowToSeller(row: StaffOrderApiRow): SellerOrder {
  return {
    id: row.id,
    customerId: row.customerId,
    createdAt: row.date,
    status: staffUiStatusToSeller(row.status),
    lines: row.items.map((it) => ({
      productId: it.productId,
      name: it.productName,
      qty: it.qty,
      unitPrice: it.unitPrice,
    })),
    note: row.notes ?? undefined,
  };
}

function mapStaffDetailToSeller(data: {
  id: string;
  customerId: string;
  date: string;
  status: string;
  notes?: string | null;
  items: { productId: string; productName: string; qty: number; unitPrice: number }[];
}): SellerOrder {
  return mapStaffListRowToSeller({
    id: data.id,
    customerId: data.customerId,
    date: data.date,
    status: data.status,
    items: data.items,
    notes: data.notes,
  });
}

type SellerContextType = {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
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
  createOrUpdateDraft: (customerId: string, lines: SellerOrderLine[], note?: string) => Promise<SellerOrder | null>;
  confirmOrder: (orderId: string) => Promise<void>;
  repeatLastOrder: (customerId: string) => Promise<string | null>;
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

type CatalogRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  promo?: string | null;
  combo?: string | null;
  tags?: string[];
};

type CustomerApiRow = {
  id: string;
  businessName: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  zone?: string | null;
  visitDay?: string | null;
  gpsLink?: string | null;
  status?: string;
};

function mapApiToSellerCustomer(c: CustomerApiRow): SellerCustomer {
  return {
    id: c.id,
    businessName: c.businessName,
    contactName: c.contactName ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
    zone: c.zone ?? "",
    visitDay: c.visitDay ?? "",
    gpsLink: c.gpsLink ?? undefined,
    balancePending: 0,
    lastPurchaseDate: null,
    purchaseFrequencyDays: 14,
    avgTicket: 0,
    status: c.status === "INACTIVE" ? "inactivo" : "activo",
    tags: [],
  };
}

function mapRowToCatalogProduct(p: CatalogRow): CatalogProduct {
  const tags = [
    ...(p.tags ?? []),
    ...(p.promo ? [String(p.promo)] : []),
    ...(p.combo ? [String(p.combo)] : []),
  ].filter(Boolean);
  return {
    id: p.id,
    name: p.name,
    unit: p.unit,
    price: p.price,
    tags,
    isOffer: Boolean(p.promo),
  };
}

export function SellerProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<SellerProfile>(emptySellerProfile);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [customers, setCustomers] = useState<SellerCustomer[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [visitsToday, setVisitsToday] = useState<SellerVisit[]>([]);
  const [followUps, setFollowUps] = useState<SellerFollowUp[]>([]);
  const [opportunities] = useState<SellerOpportunity[]>([]);
  const [offers] = useState<SellerOffer[]>([]);

  const loadSellerOrders = useCallback(async (accessToken: string) => {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/staff/orders`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      setOrders([]);
      return;
    }
    const rows = (await res.json()) as StaffOrderApiRow[];
    setOrders(rows.map(mapStaffListRowToSeller));
  }, []);

  const applySession = useCallback(
    async (accessToken: string) => {
      const base = getApiBaseUrl();
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [prRes, cuRes] = await Promise.all([
        fetch(`${base}/products`, { headers }),
        fetch(`${base}/customers`, { headers }),
      ]);
      if (prRes.ok) {
        const rows = (await prRes.json()) as CatalogRow[];
        setCatalog(rows.map(mapRowToCatalogProduct));
      } else {
        setCatalog([]);
      }
      if (cuRes.ok) {
        const crows = (await cuRes.json()) as CustomerApiRow[];
        setCustomers(crows.map(mapApiToSellerCustomer));
      } else {
        setCustomers([]);
      }
      await loadSellerOrders(accessToken);
    },
    [loadSellerOrders],
  );

  useEffect(() => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const user = await apiFetchMe(token);
        if (user.role !== "SELLER") {
          window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          setAuthenticated(false);
          return;
        }
        setProfile(sellerProfileFromUser(user));
        await applySession(token);
        setVisitsToday([]);
        setFollowUps([]);
        setAuthenticated(true);
      } catch {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!email?.trim() || !password) return "Introduce email y contraseña";
      try {
        const { accessToken, user } = await apiLogin(email.trim(), password);
        if (user.role !== "SELLER") {
          return "Esta cuenta no es de vendedor.";
        }
        setProfile(sellerProfileFromUser(user));
        await applySession(accessToken);
        setVisitsToday([]);
        setFollowUps([]);
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
        setAuthenticated(true);
        return null;
      } catch (e) {
        return networkErrorMessage(e);
      }
    },
    [applySession],
  );

  const logout = useCallback(() => {
    void apiLogout();
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setAuthenticated(false);
    setProfile(emptySellerProfile);
    setCatalog([]);
    setCustomers([]);
    setOrders([]);
    setVisitsToday([]);
    setFollowUps([]);
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
    async (customerId: string, lines: SellerOrderLine[], note?: string) => {
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token || lines.length < 1) return null;
      const base = getApiBaseUrl();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const existing = orders.find((o) => o.customerId === customerId && o.status === "borrador");
      const payload = {
        items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
        note,
      };
      const res = existing
        ? await fetch(`${base}/staff/orders/${existing.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
          })
        : await fetch(`${base}/staff/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              customerId,
              mode: "draft",
              ...payload,
            }),
          });
      if (!res.ok) {
        console.error(await parseApiErrorMessage(res));
        return null;
      }
      const data = (await res.json()) as Parameters<typeof mapStaffDetailToSeller>[0];
      const row = mapStaffDetailToSeller(data);
      await loadSellerOrders(token);
      return row;
    },
    [orders, loadSellerOrders],
  );

  const confirmOrder = useCallback(
    async (orderId: string) => {
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token) return;
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/staff/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "confirmado" }),
      });
      if (res.ok) await loadSellerOrders(token);
    },
    [loadSellerOrders],
  );

  const repeatLastOrder = useCallback(
    async (customerId: string) => {
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token) return null;
      const list = orders
        .filter((o) => o.customerId === customerId && o.status !== "borrador")
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      const last = list[0];
      if (!last) return null;
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/staff/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          mode: "draft",
          items: last.lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          note: `Repetido de ${last.id}`,
        }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { id: string };
      await loadSellerOrders(token);
      return data.id;
    },
    [orders, loadSellerOrders],
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
    catalog,
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
