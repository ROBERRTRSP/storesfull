# Endpoints API (REST) — MVP

Base: `/api/v1`

## Auth

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

## Usuarios / roles

- `GET /users` (admin)
- `POST /users` (admin)
- `PATCH /users/:id` (admin)
- `PATCH /users/:id/activate` (admin)
- `PATCH /users/:id/deactivate` (admin)

- `GET /roles` (admin)
- `POST /roles` (admin)
- `PATCH /roles/:id` (admin)
- `GET /permissions` (admin)

## Clientes

- `GET /customers` (admin/seller/delivery con scope)
- `POST /customers` (admin)
- `GET /customers/:id`
- `PATCH /customers/:id` (admin)
- `POST /customers/:id/notes` (admin/seller)
- `GET /customers/:id/balance`
- `POST /customers/:id/assign-seller` (admin)

## Productos / categorías

- `GET /products` (todos autenticados)
- `POST /products` (admin)
- `GET /products/:id`
- `PATCH /products/:id` (admin)
- `PATCH /products/:id/activate` (admin)
- `PATCH /products/:id/deactivate` (admin)

- `GET /product-categories`
- `POST /product-categories` (admin)

## Pedidos

- `GET /orders` (admin/seller/delivery; cliente solo propios)
- `POST /orders` (admin/seller/customer)
- `GET /orders/:id`
- `PATCH /orders/:id` (editar solo si `DRAFT/CONFIRMED` y antes del cutoff)
- `POST /orders/:id/confirm`
- `POST /orders/:id/cancel`
- `POST /orders/:id/repeat` (crea uno nuevo basado en anterior)

## Ciclos + lista general de compra

- `GET /purchase-cycles`
- `POST /purchase-cycles` (admin)
- `POST /purchase-cycles/:id/close` (admin) — cierra edición y genera consolidación
- `GET /purchase-cycles/:id/purchase-list` (admin/delivery)

## Compras reales (checklist)

- `POST /purchase-cycles/:id/purchase-runs` (delivery/admin)
- `GET /purchase-runs/:id`
- `PATCH /purchase-runs/:id/items/:itemId` (delivery) — bought/not_found/substituted + qty + cost + supplier
- `POST /purchase-runs/:id/documents` (delivery) — subida evidencia
- `POST /purchase-runs/:id/complete` (delivery/admin)

## Rutas / entregas

- `GET /delivery-routes` (admin/delivery)
- `POST /delivery-routes` (admin) — asigna ciclo/fecha + delivery + clientes
- `GET /delivery-routes/:id`
- `POST /delivery-routes/:id/start` (delivery)
- `POST /delivery-routes/:id/complete` (delivery)

- `GET /deliveries/:id`
- `PATCH /deliveries/:id/items/:itemId` (delivery) — delivered/partial/not_delivered + qty_delivered
- `POST /deliveries/:id/complete` (delivery)

## Pagos

- `GET /payments` (admin)
- `POST /payments` (delivery/admin) — pago a pedido/cliente
- `GET /customers/:id/payments` (admin/seller; cliente propios)

## Gastos

- `GET /expenses` (admin)
- `POST /expenses` (admin/delivery)

## Reportes (básicos MVP)

- `GET /reports/summary` (admin)
- `GET /reports/sales.csv` (admin)
- `GET /reports/payments.csv` (admin)

## Auditoría

- `GET /audit-events` (admin)

## Configuración (MVP)

- `GET /settings/payment-methods` (admin)
- `PUT /settings/payment-methods` (admin)

