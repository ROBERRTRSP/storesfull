import { NextResponse } from "next/server";
import { formatZodError, resetPasswordSchema } from "@/lib/server/auth-schemas";
import { resetPasswordWithToken } from "@/lib/server/password-reset-service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON no válido" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });
  }

  const ok = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!ok) {
    return NextResponse.json(
      { message: "El enlace no es válido o ha caducado. Solicita uno nuevo." },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
}
