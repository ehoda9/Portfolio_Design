import type { NextFunction, Request, Response } from 'express';

/**
 * A handful of standard, low-risk security headers. Written by hand
 * rather than pulling in a dependency (e.g. helmet) for what's a few
 * static header assignments — see ARCHITECTURE.md "API security posture"
 * for the reasoning behind these specific choices.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}
