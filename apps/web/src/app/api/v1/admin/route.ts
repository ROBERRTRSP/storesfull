import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    segment: "admin",
    message: "Rutas de administración: usar customers, products y futuros módulos bajo /api/v1.",
  });
}
