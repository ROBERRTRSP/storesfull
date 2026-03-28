import { SignJWT, jwtVerify } from "jose";

const enc = (secret: string) => new TextEncoder().encode(secret);

function accessSecret() {
  const s = process.env.JWT_ACCESS_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    console.error("[jwt-tokens] JWT_ACCESS_SECRET no está definido.");
    return "__production_missing_jwt_access_secret__";
  }
  return "dev-access-secret";
}

function refreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    console.error("[jwt-tokens] JWT_REFRESH_SECRET no está definido.");
    return "__production_missing_jwt_refresh_secret__";
  }
  return "dev-refresh-secret";
}

export function accessTtlSeconds(): number {
  return Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900);
}

export function refreshTtlSeconds(): number {
  return Number(process.env.JWT_REFRESH_TTL_SECONDS ?? 60 * 60 * 24 * 30);
}

export async function signAccessToken(sub: string, role: string): Promise<string> {
  const ttl = accessTtlSeconds();
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(enc(accessSecret()));
}

export async function signRefreshToken(sub: string, role: string): Promise<string> {
  const ttl = refreshTtlSeconds();
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(enc(refreshSecret()));
}

export async function verifyAccessToken(token: string): Promise<{ sub: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, enc(accessSecret()), { algorithms: ["HS256"] });
    const sub = payload.sub;
    const role = payload.role;
    if (typeof sub !== "string" || typeof role !== "string") return null;
    return { sub, role };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, enc(refreshSecret()), { algorithms: ["HS256"] });
    const sub = payload.sub;
    const role = payload.role;
    if (typeof sub !== "string" || typeof role !== "string") return null;
    return { sub, role };
  } catch {
    return null;
  }
}
