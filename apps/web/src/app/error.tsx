"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Algo salió mal</h1>
      <p className="max-w-md text-sm text-slate-600">
        {error.message || "Error inesperado. Revisa los logs de la función en Vercel (Deployments → Functions)."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => reset()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          Reintentar
        </button>
        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          Inicio
        </Link>
      </div>
    </div>
  );
}
