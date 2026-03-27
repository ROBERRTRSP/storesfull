"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { VendedorShell } from "./vendedor-shell";

export function VendedorLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/vendedor/login" || pathname === "/vendedor") {
    return <>{children}</>;
  }
  return <VendedorShell>{children}</VendedorShell>;
}
