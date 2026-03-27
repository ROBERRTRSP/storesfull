import { SellerProvider } from "@/components/vendedor/seller-context";
import { VendedorLayoutClient } from "@/components/vendedor/vendedor-layout-client";
import { ReactNode } from "react";

export default function VendedorLayout({ children }: { children: ReactNode }) {
  return (
    <SellerProvider>
      <VendedorLayoutClient>{children}</VendedorLayoutClient>
    </SellerProvider>
  );
}
