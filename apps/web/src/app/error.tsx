"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-xl font-bold text-slate-900">Algo salió mal</h1>
      <p className="max-w-md text-sm text-slate-600">{error.message || "Error inesperado"}</p>
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
