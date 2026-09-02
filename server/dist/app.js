import express from 'express';
import { healthRouter } from './routes/health.js';
/**
 * Builds the Express app without starting a listener, so tests (and
 * anything else) can exercise it directly via supertest without binding
 * a real port.
 */
export function createApp() {
    const app = express();
    app.use(express.json());
    app.use('/api/health', healthRouter);
    return app;
}
