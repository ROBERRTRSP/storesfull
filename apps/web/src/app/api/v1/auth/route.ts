import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    segment: "auth",
    routes: [
      "POST /auth/login",
      "POST /auth/refresh",
      "POST /auth/logout",
      "GET /auth/me",
      "POST /auth/register",
      "POST /auth/forgot-password",
      "POST /auth/reset-password",
    ],
  });
}
