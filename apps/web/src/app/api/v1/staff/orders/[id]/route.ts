import { NextResponse } from "next/server";
import { requireRoles, requireUser } from "@/lib/server/session";
import { getStaffOrder, patchStaffOrderStatus, replaceStaffDraftOrder } from "@/lib/server/staff-orders";

export const runtime = "nodejs";

const roles = ["ADMIN", "SELLER", "DELIVERY"];

type Ctx = { params: { id: string } };

export async function GET(req: Request, ctx: Ctx) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, roles);
  if (denied) return denied;
  const { id } = ctx.params;
  const result = await getStaffOrder(out.user, id);
  if ("error" in result) return result.error;
  return Response.json(result.data);
}

export async function PUT(req: Request, ctx: Ctx) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, ["ADMIN", "SELLER"]);
  if (denied) return denied;
  const { id } = ctx.params;
  let body: { items?: { productId?: string; qty?: number }[]; note?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length < 1) {
    return NextResponse.json({ message: "items required" }, { status: 400 });
  }
  for (const it of body.items) {
    if (typeof it.productId !== "string" || typeof it.qty !== "number" || it.qty < 1) {
      return NextResponse.json({ message: "invalid items" }, { status: 400 });
    }
  }
  const result = await replaceStaffDraftOrder(out.user, id, {
    items: body.items as { productId: string; qty: number }[],
    note: typeof body.note === "string" ? body.note : undefined,
  });
  if ("error" in result) return result.error;
  return Response.json(result.data);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, roles);
  if (denied) return denied;
  const { id } = ctx.params;
  let body: { status?: string };
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.status !== "string" || !body.status) {
    return NextResponse.json({ message: "status required" }, { status: 400 });
  }
  const result = await patchStaffOrderStatus(out.user, id, body.status);
  if ("error" in result) return result.error;
  return Response.json(result.data);
}
