import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onlyDigitsOrderNumber } from "./order-mappers";
import { staffOrderAccessWhere } from "./staff-orders";
import type { SessionUser } from "./session";

const allowedRoles = new Set(["ADMIN", "SELLER", "DELIVERY"]);

export async function listStaffPayments(user: SessionUser) {
  if (!allowedRoles.has(user.role)) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  const where =
    user.role === "ADMIN"
      ? {}
      : user.role === "SELLER"
        ? { customer: { assignments: { some: { sellerId: user.id } } } }
        : { createdById: user.id };

  const rows = await prisma.payment.findMany({
    where,
    include: { customer: true, createdBy: true, order: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const data = rows.map((p) => ({
    id: p.id,
    date: p.createdAt.toISOString().slice(0, 10),
    createdAt: p.createdAt.toISOString(),
    customerId: p.customerId,
    orderId: p.orderId,
    customerName: p.customer.businessName,
    amount: Number(p.amount),
    method: p.method,
    orderRef: p.orderId ? onlyDigitsOrderNumber(p.order?.orderNumber ?? "") : undefined,
    recordedBy: p.createdBy.fullName,
  }));
  return { data };
}

export async function createStaffPayment(
  user: SessionUser,
  body: { orderId: string; amount: number; method: string; notes?: string },
) {
  if (!allowedRoles.has(user.role)) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  if (!body.orderId || !(body.amount > 0) || !body.method?.trim()) {
    return { error: NextResponse.json({ message: "orderId, amount y method son obligatorios" }, { status: 400 }) };
  }

  const accessWhere = await staffOrderAccessWhere(user);
  if (accessWhere === null) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  const order = await prisma.order.findFirst({
    where: { AND: [accessWhere, { id: body.orderId }] },
    include: { payments: true },
  });
  if (!order) {
    return { error: NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 }) };
  }

  const paidSoFar = order.payments.reduce((s, p) => s + Number(p.amount), 0);
  const newPaid = paidSoFar + body.amount;
  const total = Number(order.total);

  const created = await prisma.payment.create({
    data: {
      customerId: order.customerId,
      orderId: order.id,
      amount: body.amount,
      method: body.method.trim(),
      notes: body.notes,
      createdById: user.id,
    },
  });

  let nextStatus = order.status;
  if (newPaid + 1e-9 >= total) {
    nextStatus = "PAID";
  } else if (newPaid > 0 && order.status === "DELIVERED") {
    nextStatus = "PAYMENT_PENDING";
  }

  if (nextStatus !== order.status) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
    });
  }

  return {
    data: {
      ok: true,
      id: created.id,
      orderStatus: nextStatus,
      paidTotal: newPaid,
      orderTotal: total,
    },
  };
}
