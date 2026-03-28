import { ReactNode } from "react";
import Link from "next/link";

type Props = {
  children: ReactNode;
  /** Título bajo la marca (ej. Acceso unificado) */
  headline: string;
  /** Párrafo descriptivo */
  description?: string;
};

/**
 * Marco visual común para login y recuperación: marca, fondo y pie.
 * Fondo y color de texto base por estilo inline mínimo por si el body global compite con Tailwind.
 */
export function AuthBrandShell({ children, headline, description }: Props) {
  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden text-slate-100 antialiased"
      style={{ backgroundColor: "#020617", color: "#f1f5f9" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% -15%, rgba(99, 102, 241, 0.45), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(30, 27, 75, 0.5), transparent 45%)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col px-4 py-8 sm:max-w-xl sm:px-6 sm:py-10">
        <header className="mb-8 flex shrink-0 items-center gap-3 sm:mb-10">
          <Link
            href="/"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/40 ring-1 ring-white/10 transition hover:bg-indigo-400"
            aria-label="Ruta — inicio"
          >
            R
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">Ruta B2B</p>
            <p className="truncate text-sm text-slate-400">Centro de control</p>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{headline}</h1>
            {description ? <p className="text-sm leading-relaxed text-slate-400">{description}</p> : null}
          </div>
          {children}
        </main>

        <footer className="mt-10 shrink-0 border-t border-white/10 pt-6 text-center text-[11px] leading-relaxed text-slate-500">
          <p>Un solo acceso para administrador, vendedor, conductor y cliente.</p>
          <p className="mt-1">© {new Date().getFullYear()} Ruta</p>
        </footer>
      </div>
    </div>
  );
}
