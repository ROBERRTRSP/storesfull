import { findActiveForCatalog } from "@/lib/server/catalog-products";
import { requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const data = await findActiveForCatalog();
  return Response.json(data);
}
