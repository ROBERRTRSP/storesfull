import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    segment: "vendors",
    message: "Perfiles Vendor vinculados a User; CRUD pendiente.",
  });
}
