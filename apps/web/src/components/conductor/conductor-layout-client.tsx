"use client";

import { ReactNode } from "react";
import { ConductorShell } from "./conductor-shell";

export function ConductorLayoutClient({ children }: { children: ReactNode }) {
  return <ConductorShell>{children}</ConductorShell>;
}
