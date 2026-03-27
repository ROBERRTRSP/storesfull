"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { ConductorShell } from "./conductor-shell";

export function ConductorLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/conductor/login" || pathname === "/conductor") {
    return <>{children}</>;
  }
  return <ConductorShell>{children}</ConductorShell>;
}
