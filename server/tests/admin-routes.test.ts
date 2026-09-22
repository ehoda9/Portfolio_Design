import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';
import { signAdminToken } from '../src/lib/auth.js';

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('admin dashboard read endpoints', () => {
  const app = createApp();
  let adminToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-not-for-real-use';
    adminToken = signAdminToken();
    await runMigrations();
  });

  afterAll(async () => {
    await getPool().end();
  });

  describe('GET /api/admin/posts', () => {
    beforeAll(async () => {
      await getPool().query('TRUNCATE posts RESTART IDENTITY CASCADE');
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'draft-one', title: 'Draft One', excerpt: 'e', content: 'c', status: 'draft' });
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'published-one', title: 'Published One', excerpt: 'e', content: 'c', status: 'published' });
    });

    it('rejects requests with no token', async () => {
      const res = await request(app).get('/api/admin/posts');
      expect(res.status).toBe(401);
    });

    it('returns every post regardless of status', async () => {
      const res = await request(app).get('/api/admin/posts').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const slugs = res.body.posts.map((p: { slug: string }) => p.slug);
      expect(slugs).toContain('draft-one');
      expect(slugs).toContain('published-one');
    });

    it('does not include a content field in the list', async () => {
      const res = await request(app).get('/api/admin/posts').set('Authorization', `Bearer ${adminToken}`);
      expect(res.body.posts[0].content).toBeUndefined();
    });
  });

  describe('GET /api/admin/posts/:id', () => {
    let draftId: number;

    beforeAll(async () => {
      const { rows } = await getPool().query<{ id: number }>('SELECT id FROM posts WHERE slug = $1', ['draft-one']);
      draftId = rows[0].id;
    });

    it('rejects requests with no token', async () => {
      const res = await request(app).get(`/api/admin/posts/${draftId}`);
      expect(res.status).toBe(401);
    });

    it('returns the full post (including content) for an admin, even a draft', async () => {
      const res = await request(app).get(`/api/admin/posts/${draftId}`).set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.post.slug).toBe('draft-one');
      expect(res.body.post.content).toBe('c');
    });

    it('returns 404 for a non-existent id', async () => {
      const res = await request(app).get('/api/admin/posts/999999').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-integer id', async () => {
      const res = await request(app).get('/api/admin/posts/not-a-number').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/contact-messages', () => {
    beforeAll(async () => {
      await getPool().query('TRUNCATE contact_messages RESTART IDENTITY CASCADE');
      await request(app).post('/api/contact').send({ name: 'Someone', email: 'a@b.com', message: 'Hello there' });
    });

    it('rejects requests with no token', async () => {
      const res = await request(app).get('/api/admin/contact-messages');
      expect(res.status).toBe(401);
    });

    it('returns submitted messages for an admin', async () => {
      const res = await request(app).get('/api/admin/contact-messages').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.messages.length).toBeGreaterThan(0);
      expect(res.body.messages[0]).toMatchObject({ name: 'Someone', email: 'a@b.com', message: 'Hello there' });
    });
  });
});
