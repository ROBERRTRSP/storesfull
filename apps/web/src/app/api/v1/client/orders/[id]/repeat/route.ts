import { clientRepeatOrder } from "@/lib/server/client-portal-data";
import { requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const result = await clientRepeatOrder(out.user.id, out.user.role, id);
  if ("error" in result) return result.error;
  return Response.json(result.data);
}
