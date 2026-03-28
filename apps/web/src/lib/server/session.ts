import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";
import { getCookieHeader } from "./cookies";
import { verifyAccessToken } from "./jwt-tokens";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

export async function requireUser(
  req: Request,
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const cookieTok = getCookieHeader(req, ACCESS_COOKIE_NAME) ?? "";
  const token = bearer || cookieTok || null;
  if (!token) {
    return { response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  const payload = await verifyAccessToken(token);
  if (!payload) {
    return { response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { role: true },
  });
  if (!user || user.status !== "ACTIVE") {
    return { response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.code,
    },
  };
}

export function requireRoles(user: SessionUser, allowed: string[]): NextResponse | null {
  if (!allowed.includes(user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}
