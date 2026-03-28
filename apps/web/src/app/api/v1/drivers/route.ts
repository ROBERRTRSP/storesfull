import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    segment: "drivers",
    message: "Perfiles Driver vinculados a User; CRUD pendiente.",
  });
}
