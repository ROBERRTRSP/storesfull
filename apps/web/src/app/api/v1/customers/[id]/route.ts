import { NextResponse } from "next/server";
import { customersFindOne, customersUpdate, type UpsertCustomerBody } from "@/lib/server/customers-repo";
import { requireRoles, requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, ["ADMIN", "SELLER"]);
  if (denied) return denied;
  const row = await customersFindOne(id);
  if (!row) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return Response.json(row);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, ["ADMIN"]);
  if (denied) return denied;
  let body: Partial<UpsertCustomerBody>;
  try {
    body = (await req.json()) as Partial<UpsertCustomerBody>;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.businessName !== "string" || !body.businessName.trim()) {
    return NextResponse.json({ message: "businessName required" }, { status: 400 });
  }
  try {
    const updated = await customersUpdate(id, body as UpsertCustomerBody);
    return Response.json(updated);
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}
