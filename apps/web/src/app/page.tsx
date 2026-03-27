/* eslint-disable react/jsx-key */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Role = "ADMIN" | "SELLER" | "DELIVERY" | "CUSTOMER";
type PayMethod = "efectivo" | "zelle" | "transferencia" | "credito";

type Client = { id: string; businessName: string; contact: string };
type Product = { id: string; name: string; price: number; refCost: number };
type OrderItem = { productId: string; qty: number };
type Order = {
  id: string;
  clientId: string;
  status: "borrador" | "confirmado" | "en_compra" | "en_ruta" | "entregado";
  items: OrderItem[];
};
type PurchaseLine = {
  productId: string;
  requiredQty: number;
  boughtQty: number;
  status: "pendiente" | "comprado" | "faltante" | "sustituido";
  unitCost?: number;
};
type Delivery = {
  orderId: string;
  delivered: boolean;
  partial: boolean;
  note?: string;
};
type Payment = { orderId: string; amount: number; method: PayMethod };

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Home() {
  const [role, setRole] = useState<Role>("ADMIN");
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState("admin@demo.local");
  const [password, setPassword] = useState("Admin1234");

  const [clients, setClients] = useState<Client[]>([
    { id: uid(), businessName: "Bodega La 9", contact: "Carlos" },
  ]);
  const [products, setProducts] = useState<Product[]>([
    { id: uid(), name: "Arroz 1kg", price: 2.5, refCost: 1.8 },
    { id: uid(), name: "Aceite 1L", price: 4.2, refCost: 3.1 },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchaseLines, setPurchaseLines] = useState<PurchaseLine[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [newClientName, setNewClientName] = useState("");
  const [newClientContact, setNewClientContact] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("0");
  const [newProductCost, setNewProductCost] = useState("0");
  const [orderClientId, setOrderClientId] = useState("");
  const [orderProductId, setOrderProductId] = useState("");
  const [orderQty, setOrderQty] = useState("1");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [payAmount, setPayAmount] = useState("0");
  const [payMethod, setPayMethod] = useState<PayMethod>("efectivo");

  const orderTotals = useMemo(() => {
    return orders.map((o) => {
      const total = o.items.reduce((sum, it) => {
        const p = products.find((pr) => pr.id === it.productId);
        return sum + (p?.price ?? 0) * it.qty;
      }, 0);
      return { ...o, total };
    });
  }, [orders, products]);

  const soldTotal = orderTotals
    .filter((o) => o.status === "entregado")
    .reduce((s, o) => s + o.total, 0);
  const costTotal = purchaseLines.reduce(
    (s, l) => s + (l.unitCost ?? 0) * (l.boughtQty || 0),
    0
  );
  const paidTotal = payments.reduce((s, p) => s + p.amount, 0);
  const gross = soldTotal - costTotal;

  const login = () => {
    if (!email || !password) return;
    setLogged(true);
  };
  const loginAsRole = (nextRole: Role) => {
    const presets: Record<Role, { email: string; password: string }> = {
      ADMIN: { email: "admin@demo.local", password: "Admin1234" },
      SELLER: { email: "seller@demo.local", password: "Seller1234" },
      DELIVERY: { email: "delivery@demo.local", password: "Delivery1234" },
      CUSTOMER: { email: "customer@demo.local", password: "Customer1234" },
    };
    setRole(nextRole);
    setEmail(presets[nextRole].email);
    setPassword(presets[nextRole].password);
    setLogged(true);
  };
  const logout = () => setLogged(false);

  const addClient = () => {
    if (!newClientName.trim()) return;
    setClients((prev) => [
      { id: uid(), businessName: newClientName, contact: newClientContact },
      ...prev,
    ]);
    setNewClientName("");
    setNewClientContact("");
  };

  const addProduct = () => {
    if (!newProductName.trim()) return;
    setProducts((prev) => [
      {
        id: uid(),
        name: newProductName,
        price: Number(newProductPrice || 0),
        refCost: Number(newProductCost || 0),
      },
      ...prev,
    ]);
    setNewProductName("");
    setNewProductPrice("0");
    setNewProductCost("0");
  };

  const createOrder = () => {
    if (!orderClientId || !orderProductId) return;
    setOrders((prev) => [
      {
        id: uid(),
        clientId: orderClientId,
        status: "borrador",
        items: [{ productId: orderProductId, qty: Number(orderQty || 1) }],
      },
      ...prev,
    ]);
  };

  const confirmOrder = (id: string) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "confirmado" } : o))
    );

  const consolidate = () => {
    const confirmed = orders.filter((o) => o.status === "confirmado");
    const map = new Map<string, number>();
    confirmed.forEach((o) =>
      o.items.forEach((it) =>
        map.set(it.productId, (map.get(it.productId) ?? 0) + it.qty)
      )
    );
    const lines: PurchaseLine[] = Array.from(map.entries()).map(([productId, qty]) => ({
      productId,
      requiredQty: qty,
      boughtQty: 0,
      status: "pendiente",
    }));
    setPurchaseLines(lines);
    setOrders((prev) =>
      prev.map((o) =>
        o.status === "confirmado" ? { ...o, status: "en_compra" } : o
      )
    );
  };

  const markBought = (productId: string) => {
    setPurchaseLines((prev) =>
      prev.map((l) =>
        l.productId === productId
          ? {
              ...l,
              status: "comprado",
              boughtQty: l.requiredQty,
              unitCost:
                products.find((p) => p.id === l.productId)?.refCost ?? 0,
            }
          : l
      )
    );
  };

  const moveToRoute = () =>
    setOrders((prev) =>
      prev.map((o) => (o.status === "en_compra" ? { ...o, status: "en_ruta" } : o))
    );

  const deliverOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "entregado" } : o))
    );
    setDeliveries((prev) => [{ orderId, delivered: true, partial: false }, ...prev]);
  };

  const registerPayment = () => {
    if (!selectedOrderId) return;
    setPayments((prev) => [
      { orderId: selectedOrderId, amount: Number(payAmount || 0), method: payMethod },
      ...prev,
    ]);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-lg">
          <p className="mb-3 inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            MVP listo para construcción real
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Plataforma de Venta por Ruta (sin almacén)
          </h1>
          <p className="mt-4 max-w-3xl text-slate-200">
            Flujo completo: pedido → consolidación de compra → compra real → entrega
            → cobro → métricas de ganancia.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/cliente"
              className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-md transition hover:bg-emerald-50 sm:w-auto"
            >
              Abrir panel cliente
            </Link>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/vendedor"
                className="inline-flex rounded-lg border border-white/35 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500/25"
              >
                Panel vendedor
              </Link>
              <Link
                href="/conductor"
                className="inline-flex rounded-lg border border-white/35 bg-sky-500/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500/30"
              >
                Panel conductor
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex rounded-lg border border-white/35 bg-indigo-500/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500/35"
              >
                Panel administrador
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Login y roles</h2>
            {!logged ? (
              <div className="mt-3 space-y-2 text-sm">
                <input className="w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
                <input className="w-full rounded border p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
                <select className="w-full rounded border p-2" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option>ADMIN</option><option>SELLER</option><option>DELIVERY</option><option>CUSTOMER</option>
                </select>
                <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={login}>Iniciar sesión</button>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button className="rounded border px-2 py-1" onClick={() => loginAsRole("ADMIN")}>Entrar ADMIN</button>
                  <button className="rounded border px-2 py-1" onClick={() => loginAsRole("SELLER")}>Entrar SELLER</button>
                  <button className="rounded border px-2 py-1" onClick={() => loginAsRole("DELIVERY")}>Entrar DELIVERY</button>
                  <button className="rounded border px-2 py-1" onClick={() => loginAsRole("CUSTOMER")}>Entrar CUSTOMER</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm">
                <p>Sesión activa como <b>{role}</b></p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button className="rounded border px-2 py-1" onClick={() => loginAsRole("ADMIN")}>Cambiar a ADMIN</button>
                  <button className="rounded border px-2 py-1" onClick={() => loginAsRole("SELLER")}>Cambiar a SELLER</button>
                  <button className="rounded border px-2 py-1" onClick={() => loginAsRole("DELIVERY")}>Cambiar a DELIVERY</button>
                  <button className="rounded border px-2 py-1" onClick={() => loginAsRole("CUSTOMER")}>Cambiar a CUSTOMER</button>
                </div>
                <button className="mt-2 rounded bg-slate-900 px-3 py-2 text-white" onClick={logout}>Cerrar sesión</button>
              </div>
            )}
          </article>

          <article className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Clientes y productos</h2>
            <div className="mt-3 space-y-2 text-sm">
              <input className="w-full rounded border p-2" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Nuevo cliente" />
              <input className="w-full rounded border p-2" value={newClientContact} onChange={(e) => setNewClientContact(e.target.value)} placeholder="Contacto" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={addClient}>Agregar cliente</button>
              <input className="w-full rounded border p-2" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Nuevo producto" />
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border p-2" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} placeholder="Precio venta" />
                <input className="rounded border p-2" value={newProductCost} onChange={(e) => setNewProductCost(e.target.value)} placeholder="Costo ref" />
              </div>
              <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={addProduct}>Agregar producto</button>
            </div>
          </article>

          <article className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Pedidos y consolidación</h2>
            <div className="mt-3 space-y-2 text-sm">
              <select className="w-full rounded border p-2" value={orderClientId} onChange={(e) => setOrderClientId(e.target.value)}>
                <option value="">Cliente</option>{clients.map((c) => <option value={c.id}>{c.businessName}</option>)}
              </select>
              <select className="w-full rounded border p-2" value={orderProductId} onChange={(e) => setOrderProductId(e.target.value)}>
                <option value="">Producto</option>{products.map((p) => <option value={p.id}>{p.name}</option>)}
              </select>
              <input className="w-full rounded border p-2" value={orderQty} onChange={(e) => setOrderQty(e.target.value)} placeholder="Cantidad" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={createOrder}>Crear pedido borrador</button>
              <button className="rounded border px-3 py-2" onClick={consolidate}>Consolidar confirmados</button>
            </div>
          </article>

          <article className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Compras, entregas y cobros</h2>
            <div className="mt-3 space-y-2 text-sm">
              <button className="rounded border px-3 py-2" onClick={moveToRoute}>Pasar pedidos a ruta</button>
              <select className="w-full rounded border p-2" value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                <option value="">Pedido para pago</option>{orders.map((o) => <option value={o.id}>{o.id.slice(0, 6)} - {o.status}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border p-2" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="Monto" />
                <select className="rounded border p-2" value={payMethod} onChange={(e) => setPayMethod(e.target.value as PayMethod)}>
                  <option value="efectivo">efectivo</option><option value="zelle">zelle</option><option value="transferencia">transferencia</option><option value="credito">credito</option>
                </select>
              </div>
              <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={registerPayment}>Registrar cobro</button>
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <section className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">Pedidos</h3>
            <div className="mt-2 space-y-2 text-sm">
              {orderTotals.map((o) => (
                <div className="rounded border p-2">
                  <div>#{o.id.slice(0, 6)} - {o.status} - ${o.total.toFixed(2)}</div>
                  <button className="mt-1 rounded border px-2 py-1" onClick={() => confirmOrder(o.id)}>Confirmar</button>
                  <button className="ml-2 mt-1 rounded border px-2 py-1" onClick={() => deliverOrder(o.id)}>Marcar entregado</button>
                </div>
              ))}
              {orderTotals.length === 0 && <p>Sin pedidos</p>}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">Lista general de compra</h3>
            <div className="mt-2 space-y-2 text-sm">
              {purchaseLines.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                return (
                  <div className="rounded border p-2">
                    <div>{p?.name} | req: {l.requiredQty} | comp: {l.boughtQty} | {l.status}</div>
                    <button className="mt-1 rounded border px-2 py-1" onClick={() => markBought(l.productId)}>Marcar comprado</button>
                  </div>
                );
              })}
              {purchaseLines.length === 0 && <p>Sin consolidación</p>}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">Resumen operativo</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Clientes: {clients.length}</li>
              <li>Productos: {products.length}</li>
              <li>Ventas entregadas: ${soldTotal.toFixed(2)}</li>
              <li>Costo real compra: ${costTotal.toFixed(2)}</li>
              <li>Cobrado: ${paidTotal.toFixed(2)}</li>
              <li>Ganancia bruta: ${gross.toFixed(2)}</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
