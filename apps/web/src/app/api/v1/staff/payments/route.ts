import { NextResponse } from "next/server";
import { requireRoles, requireUser } from "@/lib/server/session";
import { createStaffPayment, listStaffPayments } from "@/lib/server/staff-payments";

export const runtime = "nodejs";

const roles = ["ADMIN", "SELLER", "DELIVERY"];

export async function GET(req: Request) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, roles);
  if (denied) return denied;
  const result = await listStaffPayments(out.user);
  if ("error" in result) return result.error;
  return Response.json(result.data);
}

export async function POST(req: Request) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, roles);
  if (denied) return denied;
  let body: { orderId?: string; amount?: number; method?: string; notes?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const result = await createStaffPayment(out.user, {
    orderId: typeof body.orderId === "string" ? body.orderId : "",
    amount: typeof body.amount === "number" ? body.amount : 0,
    method: typeof body.method === "string" ? body.method : "",
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });
  if ("error" in result) return result.error;
  return Response.json(result.data);
}
