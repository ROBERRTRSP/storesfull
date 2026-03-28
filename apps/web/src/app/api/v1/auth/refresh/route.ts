import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { performRefresh } from "@/lib/server/auth-flow";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/server/cookies";
import { accessTtlSeconds } from "@/lib/server/jwt-tokens";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let bodyRefresh: string | undefined;
  try {
    const body = (await req.json()) as { refreshToken?: string };
    bodyRefresh = typeof body.refreshToken === "string" ? body.refreshToken : undefined;
  } catch {
    bodyRefresh = undefined;
  }

  const result = await performRefresh(req, bodyRefresh);
  if ("error" in result) return result.error;

  const ttl = accessTtlSeconds();
  const res = NextResponse.json({ accessToken: result.accessToken });
  res.cookies.set("refresh_token", result.refreshToken, refreshCookieOptions());
  res.cookies.set(ACCESS_COOKIE_NAME, result.accessToken, accessCookieOptions(ttl));
  return res;
}
