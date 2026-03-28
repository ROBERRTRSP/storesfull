import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    segment: "users",
    message: "Listado y gestión de usuarios: pendiente de implementar en Route Handlers.",
  });
}
