import { AdminProvider } from "@/components/admin/admin-context";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminProvider>
  );
}
