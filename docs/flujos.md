# Flujos clave (end-to-end)

## Flujo principal del negocio

1) **Pedido**
- Cliente (o Vendedor/Admin) crea pedido en **borrador**.
- Antes del cierre, se edita cantidades y notas.
- Se **confirma**.

2) **Cierre de ciclo**
- Admin cierra “ciclo” (p.ej. semanal) para edición.
- Pedidos confirmados pasan a `PENDING_PURCHASE`.

3) **Lista general de compra**
- Sistema consolida todos los pedidos del ciclo:
  - agrupa por producto
  - calcula cantidades requeridas
  - muestra pedidos/clientes involucrados

4) **Compra real (comprador/delivery)**
- Inicia una “salida de compra” (`purchase_run`) para el ciclo.
- Marca cada línea:
  - comprado / no encontrado / sustituido
  - cantidad comprada y precio real
  - proveedor y gastos asociados
  - evidencia (foto factura)
- El sistema calcula costo real del ciclo y diferencias vs referencia.

5) **Entrega por ruta**
- Admin asigna ruta y delivery.
- Delivery entra a cada cliente y ejecuta checklist:
  - entregado / parcial / no entregado
  - cantidad entregada
  - observaciones
- Se actualiza estado del pedido: `IN_ROUTE` → `DELIVERED`/`PARTIAL`.

6) **Cobro**
- Delivery registra pagos (método, monto, comprobante).
- Se soportan pagos parciales y crédito.
- Se actualiza balance por pedido y por cliente.

7) **Contabilidad / Ganancias**
- Ventas = suma totales pedidos entregados (o facturados).
- Costo = suma precios reales comprados.
- Gastos = gastos operativos (gasolina, peajes, etc.)
- Ganancia bruta = ventas - costo
- Ganancia neta = ventas - costo - gastos

## Estados recomendados (MVP)

### Pedido (`orders.status`)
- `DRAFT`
- `CONFIRMED`
- `CLOSED_FOR_EDITING`
- `PENDING_PURCHASE`
- `IN_PURCHASE`
- `PURCHASED` (cuando la compra del ciclo finaliza)
- `IN_ROUTE`
- `DELIVERED`
- `PARTIAL`
- `CANCELLED`
- `PAYMENT_PENDING`
- `PAID`

### Compra por línea (en lista general / run)
- `PENDING`
- `BOUGHT`
- `NOT_FOUND`
- `SUBSTITUTED`

### Entrega por línea
- `NOT_DELIVERED`
- `DELIVERED`
- `PARTIAL`

