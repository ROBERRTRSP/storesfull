# Plataforma web de venta por ruta (sin almacén)

Sistema web para operar un negocio B2B “por ruta” **sin inventario propio**:

Cliente/Vendedor crea pedidos → se consolidan → Comprador compra realmente → Delivery entrega → se cobran pagos → se calculan ventas, costos, gastos y ganancias.

## Stack (MVP)

- **Web**: Next.js (React) + Tailwind + shadcn/ui
- **API**: NestJS + REST + Swagger
- **DB**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT access + refresh tokens (rotación) + RBAC (roles + permisos)
- **Auditoría**: tabla de eventos (quién, qué, cuándo, antes/después)
- **Archivos**: almacenamiento local en dev (preparado para S3 en prod)

## Estructura

```
apps/
  api/        # NestJS (REST)
  web/        # Next.js (UI)
packages/
  shared/     # tipos, zod schemas, helpers compartidos
infra/
  docker/     # postgres, adminer (opcional)
docs/
  arquitectura.md
  base-de-datos.md
  endpoints.md
  roles-permisos.md
  flujos.md
```

## Arranque rápido (dev)

1) Requisitos: Node 18+ (recomendado 20+), Docker Desktop con `docker compose`.

2) Variables: en `apps/api` copia `.env.example` a `.env` si aún no existe.

- **Docker local:** usuario/contraseña/DB: `ruta` / `ruta` / `ruta_dev` (ver `infra/docker/docker-compose.yml`). Incluye `DIRECT_URL` igual que `DATABASE_URL`.
- **Neon (nube):** en [console.neon.tech](https://console.neon.tech) crea un proyecto → **Connection string**. Pega la URL **pooled** (`…-pooler…`) en `DATABASE_URL` y la **direct** (sin `-pooler`) en `DIRECT_URL`. Si solo usas la directa, repite la misma cadena en ambas. Añade `?sslmode=require` si Neon no lo trae ya en la plantilla.
- API en puerto **3010** para no chocar con Next (3000).

3) Levantar Postgres + Adminer:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

4) API (desde la raíz del monorepo o `apps/api`):

```bash
cd apps/api
npm install
npm run prisma:generate
npm run prisma:deploy
npm run db:seed
npm run dev
```

Swagger: `http://localhost:3010/api`  
Health: `http://localhost:3010/api/v1`

5) Web:

```bash
cd apps/web
cp .env.local.example .env.local   # opcional: apunta al backend
npm install
npm run dev
```

Panel cliente: `http://localhost:3000/cliente` (o el puerto que muestre Next).

**Login demo cliente:** `customer@demo.local` / `Customer1234` (creado por el seed).

**Paneles web con API (mismo seed):** admin `admin@demo.local` / `Admin1234`, vendedor `seller@demo.local` / `Seller1234`, conductor `driver@demo.local` / `Driver1234`.

**Vercel (Next):** `DATABASE_URL` y `DIRECT_URL` (Neon) si usas Prisma en la web; **`API_BACKEND_URL`** = URL del Nest **sin** `/api/v1` (ej. `https://tu-api.onrender.com`) para proxy `/api/v1` → backend. Opcional: `NEXT_PUBLIC_API_URL` si prefieres llamar al backend directo desde el navegador. Tras cambiar variables, **Redeploy**.

## Notas de producto (clave)

- **No hay almacén**: el “stock” no gobierna el flujo.
- El “ciclo” agrupa pedidos confirmados para generar **lista general de compra**.
- La compra real puede diferir: faltantes, sustituciones, precio real.
- Entrega por cliente con checklist.
- Cobros parciales o completos; balance pendiente por cliente.

