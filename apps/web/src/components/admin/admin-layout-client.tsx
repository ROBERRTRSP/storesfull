"use client";

import { ReactNode } from "react";
import { AdminShell } from "./admin-shell";

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
