import * as argon2 from "argon2";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCookieHeader } from "./cookies";
import { verifyPassword } from "./password";
import {
  refreshTtlSeconds,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./jwt-tokens";

async function findMatchingRefreshToken(
  candidates: { id: string; tokenHash: string }[],
  raw: string,
) {
  for (const t of candidates) {
    if (await argon2.verify(t.tokenHash, raw)) return t;
  }
  return null;
}

export async function performLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { role: true },
  });
  if (!user || user.status !== "ACTIVE") {
    return { error: NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 }) };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 }) };
  }

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(user.id, user.role.code),
    signRefreshToken(user.id, user.role.code),
  ]);
  const tokenHash = await argon2.hash(refreshToken);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + refreshTtlSeconds() * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.code,
    },
  };
}

export async function performRefresh(req: Request, bodyRefresh?: string | undefined) {
  const refreshToken =
    bodyRefresh?.trim() || getCookieHeader(req, "refresh_token") || undefined;
  if (!refreshToken) {
    return { error: NextResponse.json({ message: "Missing refresh token" }, { status: 401 }) };
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return { error: NextResponse.json({ message: "Invalid refresh token" }, { status: 401 }) };
  }

  const dbTokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.sub,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const matched = await findMatchingRefreshToken(dbTokens, refreshToken);
  if (!matched) {
    return { error: NextResponse.json({ message: "Refresh token revoked" }, { status: 401 }) };
  }

  await prisma.refreshToken.update({
    where: { id: matched.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { role: true },
  });
  if (!user || user.status !== "ACTIVE") {
    return { error: NextResponse.json({ message: "User inactive" }, { status: 401 }) };
  }

  const [accessToken, newRefreshToken] = await Promise.all([
    signAccessToken(user.id, user.role.code),
    signRefreshToken(user.id, user.role.code),
  ]);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await argon2.hash(newRefreshToken),
      expiresAt: new Date(Date.now() + refreshTtlSeconds() * 1000),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function performLogout(req: Request) {
  const refreshToken = getCookieHeader(req, "refresh_token");
  if (refreshToken) {
    const tokens = await prisma.refreshToken.findMany({
      where: { revokedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const matched = await findMatchingRefreshToken(tokens, refreshToken);
    if (matched) {
      await prisma.refreshToken.update({
        where: { id: matched.id },
        data: { revokedAt: new Date() },
      });
    }
  }
}
