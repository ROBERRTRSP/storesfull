import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';

export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  if (
    storedHash.startsWith('$2a$') ||
    storedHash.startsWith('$2b$') ||
    storedHash.startsWith('$2y$')
  ) {
    return bcrypt.compare(plain, storedHash);
  }
  try {
    return await argon2.verify(storedHash, plain);
  } catch {
    return false;
  }
}
