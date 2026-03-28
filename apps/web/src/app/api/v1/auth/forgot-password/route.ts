import { NextResponse } from "next/server";
import { formatZodError, forgotPasswordSchema } from "@/lib/server/auth-schemas";
import { sendPasswordResetEmail } from "@/lib/server/mailer";
import { createPasswordResetForEmail } from "@/lib/server/password-reset-service";

export const runtime = "nodejs";

/**
 * No revela si el email existe (respuesta genérica).
 * Rate limiting: añadir en producción (Redis / Upstash).
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON no válido" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });
  }

  const created = await createPasswordResetForEmail(parsed.data.email);
  if (created) {
    const path = `/restablecer-contrasena?token=${encodeURIComponent(created.rawToken)}`;
    await sendPasswordResetEmail(parsed.data.email.toLowerCase(), path);
  }

  return NextResponse.json({
    message:
      "Si el email está registrado, recibirás instrucciones para restablecer la contraseña en breve.",
  });
}
