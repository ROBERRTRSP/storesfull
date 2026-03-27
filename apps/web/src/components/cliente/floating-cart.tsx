"use client";

import Link from "next/link";
import { useClientData } from "./client-context";

export function FloatingCart() {
  const { cart, cartTotal } = useClientData();
  const units = cart.reduce((sum, it) => sum + it.qty, 0);

  return (
    <Link
      href="/cliente/carrito"
      aria-label={units > 0 ? `Carrito, ${units} articulos, total ${cartTotal.toFixed(2)} dolares` : "Ir al carrito"}
      className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-1 md:bottom-8 md:right-8"
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-2 ring-white/20 transition hover:bg-slate-800 hover:shadow-xl active:scale-95">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {units > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-bold text-white ring-2 ring-slate-900">
            {units > 99 ? "99+" : units}
          </span>
        )}
      </span>
      {units > 0 && (
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-md ring-1 ring-slate-200">
          ${cartTotal.toFixed(2)}
        </span>
      )}
    </Link>
  );
}
