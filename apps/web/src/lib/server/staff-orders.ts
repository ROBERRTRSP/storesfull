import type { OrderStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  nextNumericOrderNumber,
  onlyDigitsOrderNumber,
  orderStatusToUi,
  uiStatusToPrisma,
} from "./order-mappers";
import type { SessionUser } from "./session";

const deliveryVisible: OrderStatus[] = [
  "CONFIRMED",
  "CLOSED_FOR_EDITING",
  "PENDING_PURCHASE",
  "IN_PURCHASE",
  "PURCHASED",
  "IN_ROUTE",
  "PARTIAL",
  "DELIVERED",
  "PAYMENT_PENDING",
  "PAID",
];

export async function staffOrderAccessWhere(
  user: SessionUser,
): Promise<Prisma.OrderWhereInput | null> {
  if (user.role === "ADMIN") return {};
  if (user.role === "SELLER") {
    return {
      OR: [
        { createdById: user.id },
        { customer: { assignments: { some: { sellerId: user.id } } } },
      ],
    };
  }
  if (user.role === "DELIVERY") {
    return { status: { in: deliveryVisible } };
  }
  return null;
}

function canTransition(role: string, from: OrderStatus, to: OrderStatus): boolean {
  if (role === "ADMIN") return true;
  if (from === to) return true;
  if (role === "SELLER") {
    if (from === "DRAFT" && (to === "CONFIRMED" || to === "CANCELLED")) return true;
    if (from === "CONFIRMED" && (to === "PENDING_PURCHASE" || to === "CANCELLED")) return true;
    if (from === "CLOSED_FOR_EDITING" && to === "PENDING_PURCHASE") return true;
    return false;
  }
  if (role === "DELIVERY") {
    if (from === "IN_PURCHASE" && to === "PURCHASED") return true;
    if (from === "PURCHASED" && to === "IN_ROUTE") return true;
    if (from === "IN_ROUTE" && (to === "DELIVERED" || to === "PARTIAL")) return true;
    if (from === "PARTIAL" && (to === "DELIVERED" || to === "PAYMENT_PENDING")) return true;
    if (from === "DELIVERED" && to === "PAYMENT_PENDING") return true;
    if (from === "PAYMENT_PENDING" && to === "PAID") return true;
    return false;
  }
  return false;
}

export async function listStaffOrders(user: SessionUser) {
  const where = await staffOrderAccessWhere(user);
  if (where === null) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  const rows = await prisma.order.findMany({
    where,
    include: {
      customer: true,
      createdBy: true,
      items: { include: { product: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const data = rows.map((o) => ({
    id: o.id,
    number: onlyDigitsOrderNumber(o.orderNumber),
    customerId: o.customerId,
    customerName: o.customer.businessName,
    customerContactName: o.customer.contactName ?? null,
    customerPhone: o.customer.phone ?? null,
    customerAddress: o.customer.address ?? null,
    customerGpsLink: o.customer.gpsLink ?? null,
    createdBy: o.createdBy.fullName,
    sellerName: o.createdBy.fullName,
    date: o.createdAt.toISOString().slice(0, 10),
    createdAt: o.createdAt.toISOString(),
    total: Number(o.total),
    paidTotal: o.payments.reduce((s, p) => s + Number(p.amount), 0),
    status: orderStatusToUi(o.status),
    items: o.items.map((it) => ({
      productId: it.productId,
      productName: it.product.name,
      qty: it.qty,
      unitPrice: Number(it.unitPrice),
    })),
  }));
  return { data };
}

export async function getStaffOrder(user: SessionUser, id: string) {
  const where = await staffOrderAccessWhere(user);
  if (where === null) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  const order = await prisma.order.findFirst({
    where: { AND: [where, { id }] },
    include: {
      customer: true,
      createdBy: true,
      items: { include: { product: true } },
      payments: true,
    },
  });
  if (!order) {
    return { error: NextResponse.json({ message: "Not found" }, { status: 404 }) };
  }
  const data = {
    id: order.id,
    number: onlyDigitsOrderNumber(order.orderNumber),
    customerId: order.customerId,
    customerName: order.customer.businessName,
    customerContactName: order.customer.contactName ?? null,
    customerPhone: order.customer.phone ?? null,
    customerAddress: order.customer.address ?? null,
    customerGpsLink: order.customer.gpsLink ?? null,
    createdBy: order.createdBy.fullName,
    sellerName: order.createdBy.fullName,
    date: order.createdAt.toISOString().slice(0, 10),
    createdAt: order.createdAt.toISOString(),
    total: Number(order.total),
    paidTotal: order.payments.reduce((s, p) => s + Number(p.amount), 0),
    status: orderStatusToUi(order.status),
    notes: order.notes,
    items: order.items.map((it) => ({
      productId: it.productId,
      productName: it.product.name,
      qty: it.qty,
      unitPrice: Number(it.unitPrice),
      lineTotal: Number(it.lineTotal),
    })),
  };
  return { data };
}

export async function patchStaffOrderStatus(user: SessionUser, id: string, nextStatusRaw: string) {
  const where = await staffOrderAccessWhere(user);
  if (where === null) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  const next = uiStatusToPrisma(nextStatusRaw);
  if (!next) {
    return { error: NextResponse.json({ message: "Invalid status" }, { status: 400 }) };
  }
  const existing = await prisma.order.findFirst({
    where: { AND: [where, { id }] },
  });
  if (!existing) {
    return { error: NextResponse.json({ message: "Not found" }, { status: 404 }) };
  }
  if (!canTransition(user.role, existing.status, next)) {
    return {
      error: NextResponse.json(
        { message: `Transición no permitida: ${existing.status} → ${next}` },
        { status: 400 },
      ),
    };
  }
  const updated = await prisma.order.update({
    where: { id },
    data: { status: next },
    include: { customer: true, createdBy: true },
  });
  const data = {
    id: updated.id,
    number: onlyDigitsOrderNumber(updated.orderNumber),
    customerId: updated.customerId,
    customerName: updated.customer.businessName,
    createdBy: updated.createdBy.fullName,
    sellerName: updated.createdBy.fullName,
    date: updated.createdAt.toISOString().slice(0, 10),
    total: Number(updated.total),
    status: orderStatusToUi(updated.status),
  };
  return { data };
}

type ItemIn = { productId: string; qty: number };

export async function replaceStaffDraftOrder(
  user: SessionUser,
  orderId: string,
  body: { items: ItemIn[]; note?: string },
) {
  const where = await staffOrderAccessWhere(user);
  if (where === null) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  const existing = await prisma.order.findFirst({
    where: { AND: [where, { id: orderId }] },
  });
  if (!existing) {
    return { error: NextResponse.json({ message: "Not found" }, { status: 404 }) };
  }
  if (existing.status !== "DRAFT") {
    return {
      error: NextResponse.json({ message: "Solo se pueden editar pedidos en borrador" }, { status: 400 }),
    };
  }
  const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  if (products.length !== productIds.length) {
    return { error: NextResponse.json({ message: "Uno o más productos no existen" }, { status: 404 }) };
  }
  const byId = new Map(products.map((p) => [p.id, p]));
  const subtotal = body.items.reduce((sum, it) => {
    const p = byId.get(it.productId)!;
    return sum + Number(p.salePrice) * it.qty;
  }, 0);

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId } });
    await tx.order.update({
      where: { id: orderId },
      data: {
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
    });
  });

  return getStaffOrder(user, orderId);
}

export async function staffCreateOrder(
  user: SessionUser,
  body: { customerId: string; mode: "draft" | "confirm"; items: ItemIn[]; note?: string },
) {
  if (user.role !== "ADMIN" && user.role !== "SELLER") {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  if (user.role === "SELLER") {
    const assigned = await prisma.customerAssignment.findFirst({
      where: { customerId: body.customerId, sellerId: user.id },
    });
    if (!assigned) {
      return { error: NextResponse.json({ message: "No tienes asignado este cliente" }, { status: 403 }) };
    }
  }
  const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
  if (!customer) {
    return { error: NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 }) };
  }
  const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  if (products.length !== productIds.length) {
    return { error: NextResponse.json({ message: "Uno o más productos no existen" }, { status: 404 }) };
  }
  const byId = new Map(products.map((p) => [p.id, p]));
  const subtotal = body.items.reduce((sum, it) => {
    const p = byId.get(it.productId)!;
    return sum + Number(p.salePrice) * it.qty;
  }, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: nextNumericOrderNumber(),
      customerId: body.customerId,
      createdById: user.id,
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
    include: { customer: true, createdBy: true, items: { include: { product: true } } },
  });

  const data = {
    id: order.id,
    number: onlyDigitsOrderNumber(order.orderNumber),
    customerId: order.customerId,
    customerName: order.customer.businessName,
    createdBy: order.createdBy.fullName,
    sellerName: order.createdBy.fullName,
    date: order.createdAt.toISOString().slice(0, 10),
    total: Number(order.total),
    status: orderStatusToUi(order.status),
    notes: order.notes,
    items: order.items.map((it) => ({
      productId: it.productId,
      productName: it.product.name,
      qty: it.qty,
      unitPrice: Number(it.unitPrice),
      lineTotal: Number(it.lineTotal),
    })),
  };
  return { data };
}
