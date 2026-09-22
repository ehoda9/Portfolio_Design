import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';
import { signAdminToken } from '../src/lib/auth.js';

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('analytics', () => {
  const app = createApp();
  let adminToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-not-for-real-use';
    adminToken = signAdminToken();

    await runMigrations();
    await getPool().query('TRUNCATE page_views RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await getPool().end();
  });

  describe('POST /api/analytics/pageview', () => {
    it('rejects a missing path', async () => {
      const res = await request(app).post('/api/analytics/pageview').send({});
      expect(res.status).toBe(400);
    });

    it('rejects a path not starting with /', async () => {
      const res = await request(app).post('/api/analytics/pageview').send({ path: 'not-a-path' });
      expect(res.status).toBe(400);
    });

    it('accepts a valid path with no auth required', async () => {
      const res = await request(app).post('/api/analytics/pageview').send({ path: '/index.html' });
      expect(res.status).toBe(204);
    });
  });

  describe('GET /api/admin/analytics/summary', () => {
    beforeAll(async () => {
      await getPool().query('TRUNCATE page_views RESTART IDENTITY CASCADE');
      await request(app).post('/api/analytics/pageview').send({ path: '/index.html' });
      await request(app).post('/api/analytics/pageview').send({ path: '/index.html' });
      await request(app).post('/api/analytics/pageview').send({ path: '/blog.html' });
    });

    it('rejects requests with no token', async () => {
      const res = await request(app).get('/api/admin/analytics/summary');
      expect(res.status).toBe(401);
    });

    it('returns the total and per-path breakdown for an admin', async () => {
      const res = await request(app).get('/api/admin/analytics/summary').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalViews).toBe(3);
      expect(res.body.viewsByPath).toEqual(
        expect.arrayContaining([
          { path: '/index.html', count: 2 },
          { path: '/blog.html', count: 1 },
        ])
      );
      expect(Array.isArray(res.body.viewsLast7Days)).toBe(true);
    });
  });
});
