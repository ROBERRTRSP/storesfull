/** URL base de la API Nest (misma variable que en Vercel). */
export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");
  if (raw) return raw;
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
    return "No se pudo conectar con la API. Revisa NEXT_PUBLIC_API_URL y que el backend esté activo.";
  }
  if (err instanceof Error) return err.message;
  return "Error inesperado";
}
