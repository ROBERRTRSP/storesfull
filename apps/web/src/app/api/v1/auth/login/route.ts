import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { formatZodError, loginSchema } from "@/lib/server/auth-schemas";
import { performLogin } from "@/lib/server/auth-flow";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/server/cookies";
import { accessTtlSeconds } from "@/lib/server/jwt-tokens";
import { ensureDatabaseEnvLoaded } from "@/lib/server/load-env-for-prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  ensureDatabaseEnvLoaded();

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON no válido" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });
  }
  const { email, password } = parsed.data;

  try {
    const result = await performLogin(email, password);
    if ("error" in result) return result.error;

    const ttl = accessTtlSeconds();
    const res = NextResponse.json({
      accessToken: result.accessToken,
      user: result.user,
    });
    res.cookies.set("refresh_token", result.refreshToken, refreshCookieOptions());
    res.cookies.set(ACCESS_COOKIE_NAME, result.accessToken, accessCookieOptions(ttl));
    return res;
  } catch (e) {
    console.error("[api/v1/auth/login]", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("DATABASE_URL") || msg.includes("DIRECT_URL")) {
      return NextResponse.json(
        {
          message:
            "Base de datos no configurada para Next. Copia las líneas DATABASE_URL y DIRECT_URL de apps/api/.env a apps/web/.env.local, o deja apps/api/.env en su sitio y reinicia el servidor Next (npm run dev en apps/web). Postgres en marcha: docker compose -f infra/docker/docker-compose.yml up -d. Luego: npm run prisma:deploy && npm run db:seed en apps/api.",
        },
        { status: 503 },
      );
    }
    if (/P1001|P1017|connect/i.test(msg)) {
      return NextResponse.json(
        { message: "No se pudo conectar a la base de datos. Comprueba que Postgres esté en marcha y DATABASE_URL." },
        { status: 503 },
      );
    }
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
