"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSeller } from "@/components/vendedor/seller-context";

export default function VendedorIndexPage() {
  const router = useRouter();
  const { authenticated, loading } = useSeller();

  useEffect(() => {
    if (loading) return;
    router.replace(authenticated ? "/vendedor/dashboard" : "/vendedor/login");
  }, [authenticated, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
      Cargando panel...
    </div>
  );
}
