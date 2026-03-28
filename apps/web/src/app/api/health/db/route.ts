import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL no está configurada (añádela en Vercel → Environment Variables)" },
      { status: 503 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: "connected" });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo conectar a la base de datos" },
      { status: 503 },
    );
  }
}
