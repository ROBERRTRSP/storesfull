import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/constants";

const enc = (secret: string) => new TextEncoder().encode(secret);

function accessSecret(): string {
  const s = process.env.JWT_ACCESS_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    console.error("[middleware] JWT_ACCESS_SECRET no está definido: las rutas por rol quedarán bloqueadas.");
    return "__production_missing_jwt_access_secret__";
  }
  return "dev-access-secret";
}

const ROLE_PREFIX: { role: string; prefix: string }[] = [
  { role: "ADMIN", prefix: "/admin" },
  { role: "CUSTOMER", prefix: "/cliente" },
  { role: "SELLER", prefix: "/vendedor" },
  { role: "DELIVERY", prefix: "/driver" },
];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return true;
  if (/\.(ico|png|jpg|jpeg|svg|webp|gif|txt|xml)$/i.test(pathname)) return true;
  if (pathname.startsWith("/api/v1/auth/login")) return true;
  if (pathname.startsWith("/api/v1/auth/refresh")) return true;
  if (pathname.startsWith("/api/v1/auth/logout")) return true;
  if (pathname.startsWith("/api/v1/auth/forgot-password")) return true;
  if (pathname.startsWith("/api/v1/auth/reset-password")) return true;
  if (pathname === "/" || pathname === "/recuperar-contrasena" || pathname === "/restablecer-contrasena") {
    return true;
  }
  return false;
}

function legacyLoginRedirect(pathname: string): string | null {
  if (pathname === "/admin/login") return "/";
  if (pathname === "/vendedor/login") return "/";
  if (pathname === "/driver/login") return "/";
  if (pathname === "/cliente/login") return "/";
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const legacy = legacyLoginRedirect(pathname);
  if (legacy) {
    return NextResponse.redirect(new URL(legacy, req.url));
  }

  if (pathname.startsWith("/api/") || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  let role: string | null = null;
  const token = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, enc(accessSecret()), { algorithms: ["HS256"] });
      if (typeof payload.role === "string") role = payload.role;
    } catch {
      role = null;
    }
  }

  for (const { role: need, prefix } of ROLE_PREFIX) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const isLoginPath = pathname === `${prefix}/login`;
      if (isLoginPath) return NextResponse.redirect(new URL("/", req.url));
      if (!role || role !== need) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
