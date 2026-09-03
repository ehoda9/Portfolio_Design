import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { healthRouter } from './routes/health.js';
import { postsRouter } from './routes/posts.js';

/**
 * Builds the Express app without starting a listener, so tests (and
 * anything else) can exercise it directly via supertest without binding
 * a real port.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use('/api/health', healthRouter);
  app.use('/api/posts', postsRouter);

  // Centralised error handler — route handlers call next(err) on failure
  // (e.g. a DB error) instead of leaking stack traces to the client.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
