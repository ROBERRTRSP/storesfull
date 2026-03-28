import * as argon2 from "argon2";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Contraseñas nuevas con bcrypt; hashes antiguos Argon2 siguen siendo válidos. */
export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return bcrypt.compare(plain, storedHash);
  }
  try {
    return await argon2.verify(storedHash, plain);
  } catch {
    return false;
  }
}
