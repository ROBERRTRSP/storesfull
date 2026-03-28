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

- **Docker local:** usuario/contraseña/DB: `ruta` / `ruta` / `ruta_dev` (ver `infra/docker/docker-compose.yml`). El Postgres del contenedor se expone en el Mac en el puerto **5433** (el 5432 queda libre por si usas Postgres.app). En `apps/api/.env` usa `localhost:5433` en `DATABASE_URL` y `DIRECT_URL`.
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
cp .env.local.example .env.local   # Neon, JWT, NEXT_PUBLIC_* (ver archivo)
npm install
npm run dev
```

Panel cliente: `http://localhost:3000/cliente` (o el puerto que muestre Next).

**Login demo cliente:** `customer@demo.local` / `Customer1234` (creado por el seed).

**Paneles web con API (mismo seed):** admin `admin@demo.local` / `Admin1234`, vendedor `seller@demo.local` / `Seller1234`, conductor `driver@demo.local` / `Driver1234`. Tras el login unificado en `/`, las rutas base son `/admin`, `/cliente`, `/vendedor` y `/driver`. Detalle de auth: [docs/auth.md](docs/auth.md).

**Vercel (Next, carpeta `apps/web`):** el build ejecuta Prisma (`migrate deploy`) y Next; hacen falta **`DATABASE_URL`** y **`DIRECT_URL`** (Neon: pooled y direct, igual que arriba). En producción define también **`JWT_ACCESS_SECRET`** y **`JWT_REFRESH_SECRET`**: si no existen, el código usa secretos fijos de desarrollo (inseguros). Opcionales: `JWT_ACCESS_TTL_SECONDS`, `JWT_REFRESH_TTL_SECONDS`; **`NEXT_PUBLIC_API_URL`** si quieres otra URL base para `/api/v1` (si está vacío, el navegador usa el mismo origen y en servidor en Vercel se usa `VERCEL_URL`). No hay variable `API_BACKEND_URL` ni proxy a Nest en este repositorio: la API bajo `/api/v1` la implementan los Route Handlers de Next. El Nest en `apps/api` es otro proceso (local u otro host) y no interviene en el deploy de Vercel descrito aquí. Tras cambiar variables, **Redeploy**.

## Notas de producto (clave)

- **No hay almacén**: el “stock” no gobierna el flujo.
- El “ciclo” agrupa pedidos confirmados para generar **lista general de compra**.
- La compra real puede diferir: faltantes, sustituciones, precio real.
- Entrega por cliente con checklist.
- Cobros parciales o completos; balance pendiente por cliente.

