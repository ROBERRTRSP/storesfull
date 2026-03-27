# Roles y permisos (RBAC + alcance)

## Roles base

- **ADMIN**: acceso total a módulos y configuración.
- **CUSTOMER**: solo su portal (catálogo, pedidos propios, recibos, balance).
- **DELIVERY**: compra + entrega + cobro (solo rutas/ciclos asignados).
- **SELLER**: crea/edita pedidos para clientes asignados; ve métricas comerciales; no registra compras ni cobros.

## Enfoque recomendado

### 1) RBAC (rol + permisos)

Permisos a nivel “acción”:

- `customers.read`, `customers.write`
- `products.read`, `products.write`
- `orders.read`, `orders.write`, `orders.confirm`, `orders.close_editing`
- `purchase_cycles.read`, `purchase_cycles.close`
- `purchases.read`, `purchases.write`
- `routes.read`, `routes.write`
- `deliveries.read`, `deliveries.write`
- `payments.read`, `payments.write`
- `reports.read`, `settings.write`, `users.admin`, `audit.read`

### 2) Alcance (scope)

Además del permiso, se aplica alcance:

- **CUSTOMER**: solo `customerId` propio.
- **SELLER**: solo clientes asignados (tabla `customer_assignments`).
- **DELIVERY**: solo ciclos/rutas asignadas.
- **ADMIN**: sin restricciones.

## Matriz de permisos (MVP)

### ADMIN
- Todo.

### CUSTOMER
- `products.read`
- `orders.read` (propios)
- `orders.write` (propios: borrador/confirmar antes del cierre)
- `payments.read` (propios)
- `reports.read` (solo vistas propias simples: recibos)

### SELLER
- `customers.read` (asignados)
- `orders.read` (asignados)
- `orders.write` (crear/editar antes del cierre)
- `orders.confirm` (si negocio lo permite)
- `products.read`
- **No**: `payments.write`, `purchases.write`, `deliveries.write`, `settings.write`

### DELIVERY
- `purchase_cycles.read` (asignados/abiertos)
- `purchases.write` (checklist compra)
- `routes.read` (asignadas)
- `deliveries.write` (checklist entrega)
- `payments.write` (cobros en ruta)
- `customers.read` (solo para entrega: dirección/teléfono)
- `products.read`

## Reglas específicas importantes

- Un pedido **no se puede editar** si está `CLOSED_FOR_EDITING` o posterior.
- La compra real (`purchase_run_items`) puede:
  - reducir cantidad comprada
  - registrar faltante
  - registrar sustitución (trazable al producto original)
  - registrar precio real (costo)
- Entrega por cliente puede ser parcial; el balance queda pendiente.
- Cobros: múltiples pagos por pedido/cliente (parcial o completo).

