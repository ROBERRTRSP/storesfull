import { ClientProvider } from "@/components/cliente/client-context";
import { ClientShell } from "@/components/cliente/client-shell";
import { ReactNode } from "react";

export default function ClienteLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProvider>
      <ClientShell>{children}</ClientShell>
    </ClientProvider>
  );
}

