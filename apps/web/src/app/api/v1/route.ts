import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "storesfull-api",
    message: "La API REST está bajo /api/v1.",
    api: "/api/v1",
    health: "/api/v1/health",
    dbTest: "/api/v1/db-test",
  });
}
