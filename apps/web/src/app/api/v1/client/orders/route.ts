import { NextResponse } from "next/server";
import { clientCreateOrder } from "@/lib/server/client-portal-data";
import { requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  let body: { mode?: string; items?: { productId?: string; qty?: number }[]; note?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (body.mode !== "draft" && body.mode !== "confirm") {
    return NextResponse.json({ message: "mode must be draft or confirm" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length < 1) {
    return NextResponse.json({ message: "items required" }, { status: 400 });
  }
  for (const it of body.items) {
    if (typeof it.productId !== "string" || typeof it.qty !== "number" || it.qty < 1) {
      return NextResponse.json({ message: "invalid items" }, { status: 400 });
    }
  }
  const result = await clientCreateOrder(out.user.id, out.user.role, {
    mode: body.mode,
    items: body.items as { productId: string; qty: number }[],
    note: typeof body.note === "string" ? body.note : undefined,
  });
  if ("error" in result) return result.error;
  return Response.json(result.data);
}
