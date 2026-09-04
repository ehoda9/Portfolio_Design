import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('contact rate limiting', () => {
  const app = createApp();

  beforeAll(async () => {
    await runMigrations();
    await getPool().query('TRUNCATE contact_messages RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await getPool().end();
  });

  it('blocks further submissions after the limit is hit', async () => {
    const submit = () =>
      request(app)
        .post('/api/contact')
        .send({ name: 'Spammer', email: 'spam@example.com', message: 'buy my stuff' });

    // contactLimiter allows 5 requests per window (see src/middleware/rate-limiters.ts)
    for (let i = 0; i < 5; i++) {
      const res = await submit();
      expect(res.status).toBe(201);
    }

    const res = await submit();
    expect(res.status).toBe(429);
  });
});
