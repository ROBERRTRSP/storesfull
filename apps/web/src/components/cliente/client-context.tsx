"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { docsSeed, ordersSeed, paymentsSeed, productsSeed, profileSeed } from "./mock-data";
import { CartItem, ClientOrder, ClientProfile, DocumentItem, Payment, Product } from "./types";

type ClientContextType = {
  products: Product[];
  cart: CartItem[];
  orders: ClientOrder[];
  payments: Payment[];
  documents: DocumentItem[];
  profile: ClientProfile;
  addToCart: (productId: string, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  saveDraft: (note?: string) => void;
  confirmOrder: (note?: string) => void;
  repeatOrder: (orderId: string) => void;
  saveProfile: (next: ClientProfile) => Promise<void>;
  /** Rol del usuario en sesion (JWT). El cliente no puede editar su ficha comercial. */
  viewerRole: string;
  canEditProfile: boolean;
  getOrderTotal: (order: ClientOrder) => number;
  cartTotal: number;
  pendingBalance: number;
  loading: boolean;
  authenticated: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => void;
  logout: () => void;
};

const ClientContext = createContext<ClientContextType | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010/api/v1";
const TOKEN_KEY = "ruta_client_access_token";

const toReadableError = (error: unknown) => {
  if (error instanceof TypeError) {
    return "No se pudo conectar con la API. Verifica que el backend este encendido.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Error de red inesperado";
};

export function ClientProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(productsSeed);
  const [orders, setOrders] = useState<ClientOrder[]>(ordersSeed);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payments, setPayments] = useState(paymentsSeed);
  const [documents, setDocuments] = useState(docsSeed);
  const [profile, setProfile] = useState(profileSeed);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [viewerRole, setViewerRole] = useState("CUSTOMER");

  const canEditProfile = useMemo(
    () => viewerRole === "CUSTOMER" || viewerRole === "ADMIN" || viewerRole === "SELLER",
    [viewerRole],
  );

  const getOrderTotal = (order: ClientOrder) =>
    order.items.reduce((sum, it) => {
      const p = products.find((x) => x.id === it.productId);
      return sum + (p?.price ?? 0) * it.qty;
    }, 0);

  const cartTotal = cart.reduce((sum, it) => {
    const p = products.find((x) => x.id === it.productId);
    return sum + (p?.price ?? 0) * it.qty;
  }, 0);

  const addToCart = (productId: string, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((p) => p.productId === productId);
      if (!found) return [...prev, { productId, qty }];
      return prev.map((p) => (p.productId === productId ? { ...p, qty: p.qty + qty } : p));
    });
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((x) => x.productId !== productId));
      return;
    }
    setCart((prev) => prev.map((x) => (x.productId === productId ? { ...x, qty } : x)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((x) => x.productId !== productId));
  };

  const fetchJson = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    if (!token) throw new Error("No active session");
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Request failed");
    }
    return res.json();
  };

  const bootstrap = async (accessToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/client/bootstrap`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar portal cliente");
      const data = await res.json();
      setProducts(data.products ?? []);
      setOrders(data.orders ?? []);
      setPayments(data.payments ?? []);
      setDocuments(data.documents ?? []);
      setProfile(data.profile ?? profileSeed);
      setPendingBalance(Number(data.pendingBalance ?? 0));
      setViewerRole(typeof data.viewerRole === "string" ? data.viewerRole : "CUSTOMER");
      setAuthenticated(true);
      setAuthError(null);
    } catch (e: any) {
      setAuthError(toReadableError(e));
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (!stored) return;
    setToken(stored);
    void bootstrap(stored);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Credenciales invalidas");
      const data = await res.json();
      const accessToken = data.accessToken as string;
      setToken(accessToken);
      window.localStorage.setItem(TOKEN_KEY, accessToken);
      await bootstrap(accessToken);
    } catch (e: any) {
      setAuthError(toReadableError(e));
      setAuthenticated(false);
      setLoading(false);
    }
  };

  const demoLogin = () => {
    const paidTotal = paymentsSeed.reduce((sum, p) => sum + p.amount, 0);
    const due = ordersSeed.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((acc, it) => {
          const p = productsSeed.find((pr) => pr.id === it.productId);
          return acc + (p?.price ?? 0) * it.qty;
        }, 0)
      );
    }, 0);
    setProducts(productsSeed);
    setOrders(ordersSeed);
    setPayments(paymentsSeed);
    setDocuments(docsSeed);
    setProfile(profileSeed);
    setPendingBalance(Math.max(due - paidTotal, 0));
    setAuthenticated(true);
    setAuthError(null);
    setToken(null);
    setViewerRole("CUSTOMER");
  };

  const logout = () => {
    setAuthenticated(false);
    setToken(null);
    window.localStorage.removeItem(TOKEN_KEY);
    setCart([]);
    setViewerRole("CUSTOMER");
  };

  const createOrder = async (mode: "draft" | "confirm", note?: string) => {
    if (cart.length === 0) return;
    if (!authenticated || !token) return;
    await fetchJson("/client/orders", {
      method: "POST",
      body: JSON.stringify({ mode, items: cart, note }),
    });
    setCart([]);
    await bootstrap(token);
  };

  const saveDraft = (note?: string) => {
    void createOrder("draft", note);
  };
  const confirmOrder = (note?: string) => {
    void createOrder("confirm", note);
  };

  const repeatOrder = (orderId: string) => {
    const run = async () => {
      if (!authenticated || !token) return;
      await fetchJson(`/client/orders/${orderId}/repeat`, { method: "POST" });
      await bootstrap(token);
    };
    void run();
  };

  const saveProfile = async (next: ClientProfile) => {
    if (!authenticated || !token || !canEditProfile) return;
    const updated = await fetchJson<ClientProfile>("/client/profile", {
      method: "PUT",
      body: JSON.stringify(next),
    });
    setProfile(updated);
  };

  const value: ClientContextType = {
    products,
    cart,
    orders,
    payments,
    documents,
    profile,
    addToCart,
    updateCartQty,
    removeFromCart,
    saveDraft,
    confirmOrder,
    repeatOrder,
    saveProfile,
    viewerRole,
    canEditProfile,
    getOrderTotal,
    cartTotal,
    pendingBalance,
    loading,
    authenticated,
    authError,
    login,
    demoLogin,
    logout,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClientData() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClientData must be used inside ClientProvider");
  return ctx;
}

