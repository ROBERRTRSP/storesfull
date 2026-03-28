import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth/constants";

/** Clave única en localStorage (login unificado). */
export function storageKeyForRole(_role: string): string {
  return ACCESS_TOKEN_STORAGE_KEY;
}

export function dashboardPathForRole(role: string): string | null {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "SELLER":
      return "/vendedor";
    case "DELIVERY":
      return "/driver";
    case "CUSTOMER":
      return "/cliente";
    default:
      return null;
  }
}
