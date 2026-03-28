/**
 * Base de la API Nest (rutas tipo /auth/login, /client/bootstrap…).
 * - Si defines NEXT_PUBLIC_API_URL, se usa tal cual (CORS directo al backend).
 * - Si no, en desarrollo: localhost:3010.
 * - En producción: mismo sitio que la web + rewrite (Vercel: variable API_BACKEND_URL en build).
 */
export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");
  if (raw) return raw;
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3010/api/v1";
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    const host = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
    return `${host.replace(/\/+$/, "")}/api/v1`;
  }
  const backend = (process.env.API_BACKEND_URL ?? "").trim().replace(/\/+$/, "");
  if (backend) return `${backend}/api/v1`;
  return "http://localhost:3010/api/v1";
}

export async function parseApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(j.message)) return j.message.join(", ");
    if (typeof j.message === "string") return j.message;
  } catch {
    /* ignore */
  }
  return text || `Error HTTP ${res.status}`;
}

export type ApiLoginUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

export type ApiLoginResult = {
  accessToken: string;
  user: ApiLoginUser;
};

export async function apiLogin(email: string, password: string): Promise<ApiLoginResult> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }
  return res.json() as Promise<ApiLoginResult>;
}

export async function apiFetchMe(token: string): Promise<ApiLoginUser> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Sesión inválida");
  return res.json() as Promise<ApiLoginUser>;
}

export function networkErrorMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return "No se pudo conectar con la API. En Vercel: API_BACKEND_URL (y redeploy) o NEXT_PUBLIC_API_URL.";
  }
  if (err instanceof Error) return err.message;
  return "Error inesperado";
}
