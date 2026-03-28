import { getApiBaseUrl, parseApiErrorMessage } from "@/lib/api";

export async function fetchStaffOrderStatus(token: string, orderId: string): Promise<string | null> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/staff/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: string };
  return typeof data.status === "string" ? data.status : null;
}

export async function patchStaffOrderUiStatus(
  token: string,
  orderId: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/staff/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    return { ok: false, error: await parseApiErrorMessage(res) };
  }
  return { ok: true };
}

/**
 * Aplica la transición de estados que el backend permite al rol DELIVERY hasta
 * dejar el pedido en `entregado` o `parcial` (UI staff).
 */
export async function patchOrderDeliveryOutcome(
  token: string,
  orderId: string,
  outcome: "entregado" | "parcial",
): Promise<{ ok: boolean; error?: string }> {
  for (let i = 0; i < 12; i++) {
    const st = await fetchStaffOrderStatus(token, orderId);
    if (!st) return { ok: false, error: "No se pudo leer el pedido" };

    if (outcome === "entregado") {
      if (["entregado", "pendiente_pago", "pagado"].includes(st)) return { ok: true };
    } else if (st === "parcial") {
      return { ok: true };
    }

    let next: string | null = null;
    if (st === "en_compra") next = "comprado";
    else if (st === "comprado") next = "en_ruta";
    else if (st === "en_ruta") next = outcome === "entregado" ? "entregado" : "parcial";
    else if (st === "parcial" && outcome === "entregado") next = "entregado";
    else {
      return {
        ok: false,
        error: `El pedido está en estado «${st}» y no se puede avanzar desde la app del conductor. Revisa en administración.`,
      };
    }

    const r = await patchStaffOrderUiStatus(token, orderId, next);
    if (!r.ok) return r;
  }
  return { ok: false, error: "Demasiados pasos al actualizar el pedido" };
}

export async function postStaffPayment(
  token: string,
  body: { orderId: string; amount: number; method: string; notes?: string },
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/staff/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    return { ok: false, error: await parseApiErrorMessage(res) };
  }
  const data = (await res.json()) as { id?: string };
  return { ok: true, id: typeof data.id === "string" ? data.id : undefined };
}
