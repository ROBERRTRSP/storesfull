"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AdminShell } from "./admin-shell";

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login" || pathname === "/admin") {
    return <>{children}</>;
  }
  return <AdminShell>{children}</AdminShell>;
}
