import { clientUpdateProfile } from "@/lib/server/client-portal-data";
import { requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  const out = await requireUser(req);
  if ("response" in out) return out.response;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const result = await clientUpdateProfile(out.user.id, out.user.role, {
    businessName: typeof body.businessName === "string" ? body.businessName : undefined,
    contactName: typeof body.contactName === "string" ? body.contactName : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    address: typeof body.address === "string" ? body.address : undefined,
    weeklyReminder: typeof body.weeklyReminder === "boolean" ? body.weeklyReminder : undefined,
  });
  if ("error" in result) return result.error;
  return Response.json(result.data);
}
