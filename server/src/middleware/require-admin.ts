import type { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../lib/auth.js';

const BEARER_PREFIX = 'Bearer ';

/**
 * Protects a route behind a valid admin JWT in the Authorization header.
 * Responds 401 (not 403) on any failure — missing header, wrong scheme,
 * or an invalid/expired token — without distinguishing which, so a
 * caller can't use error responses to probe what's wrong with a token.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.slice(BEARER_PREFIX.length);
  const payload = verifyAdminToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
