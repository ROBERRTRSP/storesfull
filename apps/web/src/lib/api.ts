/**
 * Base de la API en el mismo origen (Next Route Handlers bajo /api/v1).
 * Opcional: NEXT_PUBLIC_API_URL para forzar otro origen (CORS).
 */
export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");
  if (raw) return raw;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    const host = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
    return `${host.replace(/\/+$/, "")}/api/v1`;
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").trim().replace(/\/+$/, "");
  return `${site}/api/v1`;
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

/** Revoca refresh en servidor y borra cookies httpOnly (`refresh_token`, `ruta_access`). */
export async function apiLogout(): Promise<void> {
  try {
    const base = getApiBaseUrl();
    await fetch(`${base}/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    /* ignorar red */
  }
}

export async function apiFetchMe(token: string): Promise<ApiLoginUser> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Sesión inválida");
  return res.json() as Promise<ApiLoginUser>;
}

export function networkErrorMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return "No se pudo conectar con la API. Comprueba la red o que el servidor Next esté en marcha.";
  }
  if (err instanceof Error) return err.message;
  return "Error inesperado";
}
