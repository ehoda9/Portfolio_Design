import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const TOKEN_EXPIRY = '2h';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

/** Compares a plaintext password against the configured admin bcrypt hash. */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error('ADMIN_PASSWORD_HASH environment variable is required');
  }
  return bcrypt.compare(password, hash);
}

/** Checks an email against the single configured admin address (case-insensitive). */
export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is required');
  }
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export function signAdminToken(): string {
  return jwt.sign({ role: 'admin' }, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });
}

export interface AdminTokenPayload {
  role: 'admin';
}

/** Verifies a bearer token, returning its payload or null if invalid/expired. */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (typeof payload === 'object' && payload !== null && payload.role === 'admin') {
      return { role: 'admin' };
    }
    return null;
  } catch {
    return null;
  }
}
