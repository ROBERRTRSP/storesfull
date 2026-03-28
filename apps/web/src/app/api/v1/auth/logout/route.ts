import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { performLogout } from "@/lib/server/auth-flow";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/server/cookies";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await performLogout(req);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("refresh_token", "", { ...refreshCookieOptions(), maxAge: 0 });
  res.cookies.set(ACCESS_COOKIE_NAME, "", { ...accessCookieOptions(0), maxAge: 0 });
  return res;
}
