# Arquitectura del sistema (venta por ruta, sin almacén)

## Principios (por qué no es inventario tradicional)

- El catálogo es **vendible** aunque no exista stock propio.
- La operación se centra en el **ciclo de pedidos** → **consolidación** → **compra real** → **entrega** → **cobro** → **ganancia**.
- Se soporta diferencia entre:
  - **lo pedido** vs **lo comprado** (faltantes/sustituciones/precio real)
  - **lo entregado** vs **lo pedido** (parcial/no entregado)
  - **lo cobrado** vs **lo facturado** (parcial/crédito)

## Componentes

### Frontend (Web App)
- Next.js App Router
- UI: Tailwind + componentes reutilizables (tablas, filtros, badges por estado, formularios rápidos)
- Páginas por rol con navegación “task-first” (para móvil en ruta)
- Cliente: catálogo + carrito + pedidos + balance/recibos
- Vendedor: CRM ligero (clientes asignados, oportunidades, crear/editar pedidos)
- Delivery/Comprador: checklist compra + checklist entrega + cobro rápido + links a mapas/WhatsApp
- Admin: panel completo + configuración + reportes

### Backend (API)
- NestJS (módulos por dominio)
- API REST versionada: `/api/v1/...`
- Autenticación:
  - Access JWT corto
  - Refresh token con rotación y revocación (tabla `refresh_tokens`)
- Autorización:
  - RBAC: roles + permisos (en DB) + “scopes” (p.ej. vendedor solo sus clientes)
- Auditoría:
  - `audit_events` para acciones críticas (antes/después)
- Archivos:
  - Storage local en dev; interfaz preparada para S3/GCS

### Base de datos (PostgreSQL)
- Diseño orientado a procesos:
  - `order` (pedido) y `order_items`
  - `purchase_cycle` (ciclo) y consolidación `purchase_list_items`
  - `purchase_runs` (salidas de compra) y `purchase_run_items` (lo real)
  - `delivery_routes` y `deliveries`/`delivery_items`
  - `payments` (múltiples por pedido/cliente)
  - `expenses` (gastos operativos / de ruta)

## Módulos de dominio (API)

- **Auth**: login, refresh, logout, reset password
- **Users**: usuarios, roles, permisos, activación
- **Customers**: clientes, asignación vendedor, rutas, notas internas
- **Catalog**: productos, categorías, promociones/etiquetas
- **Orders**: carrito/borrador, confirmación, cierre de edición, estados
- **Purchase cycles**: cierre del ciclo, lista general consolidada
- **Purchases (real)**: checklist de compra, sustituciones, factura/recibo de compra
- **Routes/Deliveries**: checklist entrega por cliente, estados, evidencias
- **Payments**: cobros parciales, comprobantes, balance
- **Accounting**: métricas (ventas, costos, gastos, ganancias)
- **Reports**: export PDF/CSV/XLSX (MVP: CSV/PDF básicos)
- **Audit**: historial filtrable
- **Settings**: métodos de pago, reglas de cierre, parámetros del negocio

## Seguridad y buenas prácticas

- Hash de contraseñas (argon2)
- Rate limit y protección anti-bruteforce en login
- Validación de DTOs (class-validator o zod)
- Soft delete/“activo-inactivo” para entidades sensibles
- Logging estructurado + trazabilidad de requests (requestId)
- Migraciones controladas (Prisma Migrate)

## Escalabilidad (futuro)

- Separar “reporting” (ETL/Read replicas) si crece volumen
- Colas (BullMQ) para PDFs, emails, notificaciones
- Integración WhatsApp Business API (webhooks) en fase 3
- Optimización de rutas (VRP) en fase 3

