import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

/**
 * Parser mínimo de .env (sin paquete dotenv: evita conflictos de bundle en Next).
 */
function parseEnvFile(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    if (!key || key.startsWith("#")) continue;
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function applyEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  try {
    const parsed = parseEnvFile(fs.readFileSync(filePath, "utf8"));
    for (const [k, v] of Object.entries(parsed)) {
      if (!v) continue;
      if (k === "DATABASE_URL" || k === "DIRECT_URL") {
        process.env[k] = v;
        continue;
      }
      if (process.env[k] === undefined || process.env[k] === "") {
        process.env[k] = v;
      }
    }
  } catch {
    /* ignorar */
  }
}

/**
 * Rutas candidatas: sube directorios desde este archivo y desde cwd (monorepo, espacios en ruta, distintos cwd).
 * `apps/web/.env.local` se aplica al final para ganar sobre `apps/api/.env`.
 */
function discoverEnvFilePaths(): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const push = (p: string) => {
    const abs = path.resolve(p);
    if (seen.has(abs) || !fs.existsSync(abs)) return;
    seen.add(abs);
    ordered.push(abs);
  };

  const walkFrom = (startDir: string) => {
    let dir = path.resolve(startDir);
    for (let i = 0; i < 28; i++) {
      push(path.join(dir, "apps", "api", ".env"));
      push(path.join(dir, "apps", "api", ".env.local"));
      if (path.basename(dir) === "web" && path.basename(path.dirname(dir)) === "apps") {
        push(path.join(dir, "..", "api", ".env"));
        push(path.join(dir, "..", "api", ".env.local"));
        push(path.join(dir, ".env.local"));
        push(path.join(dir, ".env"));
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  };

  try {
    walkFrom(path.dirname(fileURLToPath(import.meta.url)));
  } catch {
    /* import.meta no disponible en algún bundle */
  }
  walkFrom(process.cwd());

  const cwd = process.cwd();
  [
    path.join(cwd, "apps", "api", ".env"),
    path.join(cwd, "apps", "api", ".env.local"),
    path.join(cwd, "..", "api", ".env"),
    path.join(cwd, "..", "api", ".env.local"),
    path.join(cwd, "api", ".env"),
    path.join(cwd, "apps", "web", ".env.local"),
    path.join(cwd, ".env.local"),
  ].forEach((p) => push(p));

  const norm = (p: string) => p.split(path.sep).join("/");
  const webLocal = ordered.filter((p) => norm(p).endsWith("apps/web/.env.local"));
  const other = ordered.filter((p) => !norm(p).endsWith("apps/web/.env.local"));
  return [...other, ...webLocal];
}

export function ensureDatabaseEnvLoaded(): void {
  const dev = process.env.NODE_ENV !== "production";
  const cwd = process.cwd();

  const monorepoGuess = path.resolve(cwd, "..", "..");
  for (const dir of [
    path.join(cwd, "..", "api"),
    path.join(cwd, "apps", "api"),
    path.join(cwd, "apps", "web"),
    cwd,
    monorepoGuess,
  ]) {
    try {
      if (fs.existsSync(dir)) loadEnvConfig(dir, dev);
    } catch {
      /* ignorar */
    }
  }

  for (const f of discoverEnvFilePaths()) {
    applyEnvFile(f);
  }

  /** Último recurso en desarrollo: apps/api/.env.example trae URLs Docker por defecto. */
  if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
    const extra: string[] = [
      path.join(cwd, "apps", "api", ".env.example"),
      path.join(cwd, "..", "api", ".env.example"),
    ];
    try {
      let dir = path.dirname(fileURLToPath(import.meta.url));
      for (let i = 0; i < 22; i++) {
        extra.push(path.join(dir, "apps", "api", ".env.example"));
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
    } catch {
      /* */
    }
    for (const p of Array.from(new Set(extra.map((x) => path.resolve(x))))) {
      if (fs.existsSync(p)) {
        applyEnvFile(p);
        if (process.env.DATABASE_URL) break;
      }
    }
  }
}
