import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email no válido").max(320),
  password: z.string().min(1, "La contraseña es obligatoria").max(500),
});

export const registerSchema = z.object({
  email: z.string().trim().email("Email no válido").max(320),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(128)
    .regex(/[A-Za-z]/, "Debe incluir al menos una letra")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
  fullName: z.string().trim().min(1, "Nombre obligatorio").max(200),
  roleCode: z.enum(["ADMIN", "CUSTOMER", "SELLER", "DELIVERY"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email no válido").max(320),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, "Enlace inválido o caducado").max(200),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(128)
    .regex(/[A-Za-z]/, "Debe incluir al menos una letra")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
});

export function formatZodError(err: z.ZodError): string {
  return err.issues.map((e) => e.message).join(". ") || "Datos no válidos";
}
