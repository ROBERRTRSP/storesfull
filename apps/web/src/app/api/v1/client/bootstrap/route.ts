import { clientBootstrap } from "@/lib/server/client-portal-data";
import { requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  const boot = await clientBootstrap(out.user.id, out.user.role);
  if ("error" in boot) return boot.error;
  return Response.json({ ...boot.data, viewerRole: out.user.role });
}
