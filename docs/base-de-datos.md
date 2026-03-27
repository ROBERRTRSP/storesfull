# Diseño de base de datos (PostgreSQL) + ER (texto)

## Entidades principales (MVP)

### Seguridad
- `users`
- `roles`
- `permissions`
- `role_permissions`
- `refresh_tokens`

### Operación
- `customers`
- `customer_assignments` (vendedor→cliente)
- `routes` (rutas “plantilla”)
- `route_stops` (clientes por ruta + orden sugerido)

### Catálogo
- `product_categories`
- `products`

### Pedidos
- `orders`
- `order_items`

### Ciclo y lista general de compra
- `purchase_cycles` (semana/ciclo de pedidos)
- `purchase_cycle_orders` (pedidos incluidos)
- `purchase_list_items` (consolidación por producto)

### Compra real
- `purchase_runs` (salida de compra: quién, cuándo, ciclo)
- `purchase_run_items` (resultado real por producto: comprado/faltante/sustitución)
- `purchase_documents` (fotos/facturas)
- `expenses` (gastos: compra/ruta/operativo)

### Entregas
- `delivery_routes` (jornada/ruta asignada a delivery)
- `deliveries` (por cliente/pedido)
- `delivery_items`

### Cobros
- `payments` (múltiples por pedido/cliente)

### Auditoría
- `audit_events`

## Modelo ER (relaciones)

- `users` (1) → (N) `orders` (created_by)
- `customers` (1) → (N) `orders`
- `orders` (1) → (N) `order_items` → (1) `products`
- `purchase_cycles` (1) → (N) `purchase_cycle_orders` → (1) `orders`
- `purchase_cycles` (1) → (N) `purchase_list_items` → (1) `products`
- `purchase_runs` (N) → (1) `purchase_cycles`
- `purchase_runs` (1) → (N) `purchase_run_items` → (1) `products`
- `purchase_run_items` (optional) → (1) `products` as substitute_product
- `delivery_routes` (N) → (1) `purchase_cycles` (o por fecha)
- `deliveries` (N) → (1) `delivery_routes`
- `deliveries` (N) → (1) `orders` (normalmente 1 entrega por pedido; soporta reintentos)
- `deliveries` (1) → (N) `delivery_items` → `products`
- `payments` (N) → (1) `orders` y (N) → (1) `customers`

## Campos clave (resumen)

### `customers`
- negocio, contacto, teléfono, email, dirección, gps_link, zona/ruta, día_visita
- `credit_limit`, `credit_days`
- `status` (ACTIVE/INACTIVE)

### `products`
- nombre, categoría, descripción, imagen_url, sku, unidad
- `sale_price`
- `reference_cost` (opcional)
- `is_active`

### `orders`
- `order_number` (único)
- `status`
- `subtotal`, `discount_total`, `total`
- `expected_payment_method` (opcional)
- `notes`
- `created_by_user_id`

### `purchase_cycles`
- nombre/etiqueta (p.ej. “Semana 13”)
- `cutoff_at` (cierre edición)
- `status` (OPEN/CLOSED/IN_PURCHASE/COMPLETED)

### `purchase_list_items`
- `required_qty` (consolidada)
- `bought_qty`, `missing_qty`
- `status` (PENDING/BOUGHT/NOT_FOUND/SUBSTITUTED)
- `avg_real_cost` (derivado)

### `payments`
- monto, método, fecha, notas, comprobante_url
- referencia: pedido y cliente

### `audit_events`
- entidad, entity_id, acción, user_id, timestamp, `before_json`, `after_json`

## Notas de diseño importantes

- El “stock” no es obligatorio. Si se agrega en el futuro, será **opcional** y no bloqueará ventas.
- La consolidación vive en `purchase_list_items` para consultas rápidas en móvil.
- Los cálculos contables se derivan de:
  - ventas (`orders` entregados)
  - costos reales (`purchase_run_items`)
  - gastos (`expenses`)

