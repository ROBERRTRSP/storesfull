import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findActiveForCatalog } from "./catalog-products";

function mapOrderStatus(status: string) {
  const map: Record<string, string> = {
    DRAFT: "borrador",
    CONFIRMED: "confirmado",
    CLOSED_FOR_EDITING: "pendiente_de_compra",
    PENDING_PURCHASE: "pendiente_de_compra",
    IN_PURCHASE: "en_compra",
    PURCHASED: "comprado",
    IN_ROUTE: "en_ruta",
    DELIVERED: "entregado",
    PARTIAL: "parcial",
    CANCELLED: "cancelado",
    PAYMENT_PENDING: "pendiente_de_pago",
    PAID: "pagado",
  };
  return map[status];
}

async function getCustomerForUser(userId: string, role: string) {
  if (role !== "CUSTOMER") {
    return {
      error: NextResponse.json(
        { message: "El portal de cliente solo está disponible para cuentas con rol CLIENTE." },
        { status: 403 },
      ),
    };
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: NextResponse.json({ message: "User not found" }, { status: 404 }) };

  const customer = await prisma.customer.findFirst({
    where: { email: { equals: user.email, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
  });
  if (!customer) {
    return {
      error: NextResponse.json(
        {
          message:
            "No hay un perfil de cliente vinculado a tu correo. Pide al administrador que asocie tu cuenta.",
        },
        { status: 404 },
      ),
    };
  }
  return { customer };
}

function orderTotal(items: { lineTotal: unknown }[]) {
  return items.reduce((sum, it) => sum + Number(it.lineTotal), 0);
}

function onlyDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : value;
}

function nextNumericOrderNumber(): string {
  return `${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
}

export async function clientBootstrap(userId: string, role: string) {
  const c = await getCustomerForUser(userId, role);
  if ("error" in c) return { error: c.error };
  const customer = c.customer;

  const [products, orders, payments] = await Promise.all([
    findActiveForCatalog(),
    prisma.order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const mappedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: onlyDigits(o.orderNumber),
    createdAt: o.createdAt.toISOString().slice(0, 10),
    status: mapOrderStatus(o.status),
    items: o.items.map((it) => ({ productId: it.productId, qty: it.qty })),
    note: o.notes ?? undefined,
    total: orderTotal(o.items),
  }));

  const orderById = new Map(orders.map((o) => [o.id, o]));

  const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const invoiced = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingBalance = Math.max(invoiced - paid, 0);

  const documents = [
    ...orders.map((o) => ({
      id: `inv-${o.id}`,
      number: onlyDigits(o.orderNumber),
      type: "factura" as const,
      orderId: o.id,
      orderNumber: onlyDigits(o.orderNumber),
      date: o.createdAt.toISOString().slice(0, 10),
      total: Number(o.total),
    })),
    ...payments.map((p) => {
      const linked = p.orderId ? orderById.get(p.orderId) : undefined;
      return {
        id: `rcp-${p.id}`,
        number: String(p.createdAt.getTime()),
        type: "recibo" as const,
        orderId: p.orderId ?? "sin-pedido",
        orderNumber: linked ? onlyDigits(linked.orderNumber) : undefined,
        date: p.createdAt.toISOString().slice(0, 10),
        total: Number(p.amount),
      };
    }),
  ];

  return {
    data: {
      profile: {
        businessName: customer.businessName,
        contactName: customer.contactName ?? "",
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        address: customer.address ?? "",
        weeklyReminder: customer.notes?.includes("[weekly_reminder=true]") ?? true,
      },
      products,
      orders: mappedOrders,
      payments: payments.map((p) => ({
        id: p.id,
        date: p.createdAt.toISOString().slice(0, 10),
        amount: Number(p.amount),
        method: p.method,
      })),
      documents,
      pendingBalance,
    },
  };
}

type OrderItemIn = { productId: string; qty: number };

export async function clientCreateOrder(
  userId: string,
  role: string,
  body: { mode: "draft" | "confirm"; items: OrderItemIn[]; note?: string },
) {
  const c = await getCustomerForUser(userId, role);
  if ("error" in c) return { error: c.error };
  const customer = c.customer;

  const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  if (products.length !== productIds.length) {
    return { error: NextResponse.json({ message: "One or more products were not found" }, { status: 404 }) };
  }
  const byId = new Map(products.map((p) => [p.id, p]));
  const subtotal = body.items.reduce((sum, it) => {
    const p = byId.get(it.productId)!;
    return sum + Number(p.salePrice) * it.qty;
  }, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: nextNumericOrderNumber(),
      customerId: customer.id,
      createdById: userId,
      status: body.mode === "draft" ? "DRAFT" : "CONFIRMED",
      notes: body.note,
      subtotal,
      total: subtotal,
      items: {
        create: body.items.map((it) => {
          const p = byId.get(it.productId)!;
          const unitPrice = Number(p.salePrice);
          return {
            productId: it.productId,
            qty: it.qty,
            unitPrice,
            lineTotal: unitPrice * it.qty,
          };
        }),
      },
    },
    include: { items: true },
  });

  return {
    data: {
      id: order.id,
      orderNumber: onlyDigits(order.orderNumber),
      createdAt: order.createdAt.toISOString().slice(0, 10),
      status: mapOrderStatus(order.status),
      items: order.items.map((it) => ({ productId: it.productId, qty: it.qty })),
      note: order.notes ?? undefined,
    },
  };
}

export async function clientRepeatOrder(userId: string, role: string, orderId: string) {
  const c = await getCustomerForUser(userId, role);
  if ("error" in c) return { error: c.error };
  const customer = c.customer;

  const source = await prisma.order.findFirst({
    where: { id: orderId, customerId: customer.id },
    include: { items: true },
  });
  if (!source) return { error: NextResponse.json({ message: "Order not found" }, { status: 404 }) };

  return clientCreateOrder(userId, role, {
    mode: "draft",
    items: source.items.map((it) => ({ productId: it.productId, qty: it.qty })),
    note: `Repetido de ${onlyDigits(source.orderNumber)}`,
  });
}

export async function clientUpdateProfile(
  userId: string,
  role: string,
  body: {
    businessName?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    weeklyReminder?: boolean;
  },
) {
  const c = await getCustomerForUser(userId, role);
  if ("error" in c) return { error: c.error };
  const customer = c.customer;

  const notes =
    body.weeklyReminder === undefined
      ? customer.notes
      : `${(customer.notes ?? "")
          .replace("[weekly_reminder=true]", "")
          .replace("[weekly_reminder=false]", "")
          .trim()} [weekly_reminder=${body.weeklyReminder ? "true" : "false"}]`.trim();

  const updated = await prisma.customer.update({
    where: { id: customer.id },
    data: {
      businessName: body.businessName ?? customer.businessName,
      contactName: body.contactName ?? customer.contactName,
      phone: body.phone ?? customer.phone,
      email: body.email ?? customer.email,
      address: body.address ?? customer.address,
      notes,
    },
  });

  return {
    data: {
      businessName: updated.businessName,
      contactName: updated.contactName ?? "",
      phone: updated.phone ?? "",
      email: updated.email ?? "",
      address: updated.address ?? "",
      weeklyReminder: notes?.includes("[weekly_reminder=true]") ?? true,
    },
  };
}
