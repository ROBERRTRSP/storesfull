import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Carpeta de la API Nest (misma BD y JWT que las Route Handlers bajo /api/v1). */
const apiPackageDir = path.resolve(__dirname, "..", "api");
const dev = process.env.NODE_ENV !== "production";
// Next solo carga .env desde apps/web; sin esto, Prisma en /api/v1 falla con "DATABASE_URL" ausente → HTTP 500.
loadEnvConfig(apiPackageDir, dev);
loadEnvConfig(__dirname, dev);

/** Monorepo: dependencias en la raíz; necesario para serverless en Vercel. */
const monorepoRoot = path.resolve(__dirname, "..", "..");
loadEnvConfig(monorepoRoot, dev);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

if (process.env.NODE_ENV === "production") {
  nextConfig.experimental = {
    outputFileTracingRoot: monorepoRoot,
  };
}

export default nextConfig;
