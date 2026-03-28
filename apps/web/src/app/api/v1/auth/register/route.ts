import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatZodError, registerSchema } from "@/lib/server/auth-schemas";
import { hashPassword } from "@/lib/server/password";
import { requireRoles, requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

/** Alta de usuario (solo administrador). */
export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;
  const forbidden = requireRoles(auth.user, ["ADMIN"]);
  if (forbidden) return forbidden;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON no válido" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });
  }

  const { email, password, fullName, roleCode } = parsed.data;
  const normalized = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json({ message: "Ya existe un usuario con ese email" }, { status: 409 });
  }

  const role = await prisma.role.findUnique({ where: { code: roleCode } });
  if (!role) {
    return NextResponse.json({ message: "Rol no encontrado" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      fullName: fullName.trim(),
      passwordHash,
      roleId: role.id,
    },
    include: { role: true },
  });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.code,
      },
    },
    { status: 201 },
  );
}
