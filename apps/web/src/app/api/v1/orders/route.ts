import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    {
      message:
        "Usa GET /api/v1/staff/orders con autenticación (ADMIN, SELLER o DELIVERY) para listar pedidos operativos.",
    },
    { status: 404 },
  );
}
