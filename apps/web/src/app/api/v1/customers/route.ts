import { NextResponse } from "next/server";
import {
  customersCreate,
  customersFindAll,
  type UpsertCustomerBody,
} from "@/lib/server/customers-repo";
import { requireRoles, requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, ["ADMIN", "SELLER"]);
  if (denied) return denied;
  return Response.json(await customersFindAll());
}

export async function POST(req: Request) {
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
  const created = await customersCreate(body as UpsertCustomerBody);
  return Response.json(created);
}
