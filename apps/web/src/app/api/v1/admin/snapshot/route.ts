import { buildAdminSnapshot } from "@/lib/server/admin-snapshot";
import { requireRoles, requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET(_req: Request) {
  const out = await requireUser(_req);
  if ("response" in out) return out.response;
  const denied = requireRoles(out.user, ["ADMIN"]);
  if (denied) return denied;
  const data = await buildAdminSnapshot();
  return Response.json(data);
}
