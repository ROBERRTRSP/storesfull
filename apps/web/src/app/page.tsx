import { Suspense } from "react";
import { UnifiedLoginScreen } from "@/components/auth/unified-login-screen";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Cargando…</div>
      }
    >
      <UnifiedLoginScreen />
    </Suspense>
  );
}
