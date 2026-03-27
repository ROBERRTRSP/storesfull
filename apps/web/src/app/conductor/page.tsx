"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConductor } from "@/components/conductor/conductor-context";

export default function ConductorIndexPage() {
  const router = useRouter();
  const { authenticated, loading } = useConductor();

  useEffect(() => {
    if (loading) return;
    router.replace(authenticated ? "/conductor/dashboard" : "/conductor/login");
  }, [authenticated, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
      Cargando panel conductor...
    </div>
  );
}
