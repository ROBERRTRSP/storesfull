# Autenticación y autorización (Ruta)

## Resumen

- **Un solo login** en `/` (email + contraseña).
- Tras autenticarse, el cliente recibe un **JWT de acceso** (corto) y un **JWT de refresco** (largo). El refresco se guarda en cookie **httpOnly** (`refresh_token`, path `/api/v1/auth`). El acceso se expone también en cookie **httpOnly** `ruta_access` (path `/`) para que el **middleware** de Next pueda proteger rutas sin leer `localStorage`.
- En el navegador el mismo JWT de acceso se guarda en **localStorage** bajo la clave única `ruta_access_token` para las peticiones `Authorization: Bearer`.
- **Contraseñas**: bcrypt (coste 12) en usuarios nuevos y tras restablecer; los hashes Argon2 antiguos siguen siendo aceptados al iniciar sesión.
- **Refresh tokens** almacenados en BD siguen hasheados con **Argon2** (el JWT de refresco puede ser largo; bcrypt no es adecuado como único hash opaco).

## Roles en base de datos

| Código en BD | Producto        | Redirección tras login |
|--------------|-----------------|-------------------------|
| `ADMIN`      | Administrador   | `/admin`                |
| `CUSTOMER`   | Cliente         | `/cliente`              |
| `SELLER`     | Vendedor        | `/vendedor`             |
| `DELIVERY`   | Conductor       | `/driver`               |

## Variables de entorno (secretos)

Definir en `apps/api/.env` y/o `apps/web/.env.local` (mismos valores en local):

| Variable                 | Uso                                      |
|--------------------------|------------------------------------------|
| `JWT_ACCESS_SECRET`      | Firma del access JWT (obligatorio prod)  |
| `JWT_REFRESH_SECRET`     | Firma del refresh JWT                    |
| `JWT_ACCESS_TTL_SECONDS` | TTL access (default 900)                 |
| `JWT_REFRESH_TTL_SECONDS`| TTL refresh (default 30 días)            |
| `DATABASE_URL` / `DIRECT_URL` | PostgreSQL + migraciones           |
| `NEXT_PUBLIC_SITE_URL`   | Enlaces en emails de recuperación      |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Envío real de correo (opcional) |

Sin SMTP, en desarrollo el enlace de recuperación se **imprime en consola del servidor**.

## Endpoints (`/api/v1`)

| Método | Ruta                      | Descripción |
|--------|---------------------------|-------------|
| POST   | `/auth/login`             | Login; set cookies + JSON `{ accessToken, user }` |
| POST   | `/auth/refresh`           | Rota refresh; renueva cookies y access |
| POST   | `/auth/logout`            | Revoca refresh conocido; borra cookies |
| GET    | `/auth/me`                | Usuario actual (Bearer o cookie `ruta_access`) |
| POST   | `/auth/register`          | Alta usuario (**solo ADMIN**), body validado con Zod |
| POST   | `/auth/forgot-password`   | Crea token de reset 1h; email genérico de respuesta |
| POST   | `/auth/reset-password`    | `token` + `password` (reglas Zod) |

### Registro (admin)

```http
POST /api/v1/auth/register
Authorization: Bearer <access>
Content-Type: application/json

{
  "email": "nuevo@empresa.com",
  "password": "Secreto123",
  "fullName": "Nombre Apellido",
  "roleCode": "SELLER"
}
```

`roleCode`: `ADMIN` | `CUSTOMER` | `SELLER` | `DELIVERY`.

## Middleware (Next.js)

Archivo: `apps/web/src/middleware.ts`.

- Comprueba el JWT en la cookie `ruta_access`.
- Restringe por prefijo: solo `ADMIN` entra en `/admin`, solo `DELIVERY` en `/driver`, etc.
- Las rutas `/api/*` no se bloquean aquí; cada handler usa `requireUser` / `requireRoles`.
- Los antiguos `/admin/login`, `/vendedor/login`, `/driver/login` redirigen a `/`.

## Recuperación de contraseña

1. Usuario envía email en `/recuperar-contrasena` → `POST /auth/forgot-password`.
2. Se crea fila `PasswordResetToken` (hash SHA-256 del token opaco).
3. Email con enlace `/restablecer-contrasena?token=...`.
4. `POST /auth/reset-password` con `token` y `password` → bcrypt nuevo hash, invalida sesiones (refresh revocados).

## Estructura de código (web)

- `src/lib/server/auth-flow.ts` — login, refresh, logout (Prisma + JWT + cookies).
- `src/lib/server/password.ts` — bcrypt + compat Argon2.
- `src/lib/server/session.ts` — `requireUser`, `requireRoles` (Bearer + cookie).
- `src/lib/server/auth-schemas.ts` — validación Zod.
- `src/lib/server/password-reset-service.ts` — tokens de reset.
- `src/lib/server/mailer.ts` — SMTP opcional.
- `src/middleware.ts` — autorización por ruta.
- `src/lib/auth/constants.ts` — nombres de cookie y localStorage.

## Seguridad

- No devolver si el email existe en forgot-password (mensaje genérico).
- Contraseñas nunca en logs; errores de API sin stack al cliente.
- En producción: `secure: true` en cookies, secretos fuertes y HTTPS.
