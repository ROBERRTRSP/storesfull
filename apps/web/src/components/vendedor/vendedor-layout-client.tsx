"use client";

import { ReactNode } from "react";
import { VendedorShell } from "./vendedor-shell";

export function VendedorLayoutClient({ children }: { children: ReactNode }) {
  return <VendedorShell>{children}</VendedorShell>;
}
