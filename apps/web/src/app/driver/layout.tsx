import { ConductorProvider } from "@/components/conductor/conductor-context";
import { ConductorLayoutClient } from "@/components/conductor/conductor-layout-client";
import { ReactNode } from "react";

export default function ConductorLayout({ children }: { children: ReactNode }) {
  return (
    <ConductorProvider>
      <ConductorLayoutClient>{children}</ConductorLayoutClient>
    </ConductorProvider>
  );
}
