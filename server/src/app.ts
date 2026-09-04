import cors from 'cors';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { healthRouter } from './routes/health.js';
import { postsRouter } from './routes/posts.js';
import { authRouter } from './routes/auth.js';
import { contactRouter } from './routes/contact.js';
import { apiLimiter, contactLimiter, loginLimiter } from './middleware/rate-limiters.js';
import { getAllowedOrigins } from './lib/cors-config.js';

/**
 * Builds the Express app without starting a listener, so tests (and
 * anything else) can exercise it directly via supertest without binding
 * a real port.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: getAllowedOrigins() }));
  app.use(express.json());

  // A light ceiling on the whole API first, then stricter limits layered
  // on top of specific endpoints that are more sensitive to abuse.
  app.use('/api', apiLimiter);

  app.use('/api/health', healthRouter);
  app.use('/api/posts', postsRouter);
  app.use('/api/auth/login', loginLimiter);
  app.use('/api/auth', authRouter);
  app.use('/api/contact', contactLimiter, contactRouter);

  // Centralised error handler — route handlers call next(err) on failure
  // (e.g. a DB error) instead of leaking stack traces to the client.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
