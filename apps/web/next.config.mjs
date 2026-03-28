import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo: dependencias suelen estar en la raíz del repo; sin esto Vercel puede romper las Serverless Functions. */
const monorepoRoot = path.resolve(__dirname, "..", "..");

/** Origen del backend Nest (sin /api/v1). En Vercel: variable API_BACKEND_URL → el front usa /api/v1 en el mismo dominio. */
const apiBackend = (process.env.API_BACKEND_URL ?? "").trim().replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingRoot: monorepoRoot,
  },
  async rewrites() {
    if (!apiBackend) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBackend}/api/v1/:path*`,
      },
    ];
  },
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

export default nextConfig;
