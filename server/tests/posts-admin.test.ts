import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';
import { signAdminToken } from '../src/lib/auth.js';

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

const validPost = {
  slug: 'admin-test-post',
  title: 'Admin Test Post',
  excerpt: 'Created via test',
  content: 'Full content here',
  status: 'draft',
};

describeIfDb('admin post write endpoints', () => {
  const app = createApp();
  let adminToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-not-for-real-use';
    adminToken = signAdminToken();

    await runMigrations();
    await getPool().query('TRUNCATE posts RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await getPool().end();
  });

  describe('POST /api/posts', () => {
    it('rejects requests with no token', async () => {
      const res = await request(app).post('/api/posts').send(validPost);
      expect(res.status).toBe(401);
    });

    it('rejects requests with an invalid token', async () => {
      const res = await request(app).post('/api/posts').set('Authorization', 'Bearer not-a-real-token').send(validPost);
      expect(res.status).toBe(401);
    });

    it('rejects invalid input even with a valid token', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validPost, slug: 'Not A Valid Slug!' });

      expect(res.status).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('creates a post with a valid token and valid input', async () => {
      const res = await request(app).post('/api/posts').set('Authorization', `Bearer ${adminToken}`).send(validPost);

      expect(res.status).toBe(201);
      expect(res.body.post.slug).toBe('admin-test-post');
      expect(typeof res.body.post.id).toBe('number');
    });

    it('rejects a duplicate slug with 409', async () => {
      const res = await request(app).post('/api/posts').set('Authorization', `Bearer ${adminToken}`).send(validPost);
      expect(res.status).toBe(409);
    });

    it('a newly created draft is not publicly visible', async () => {
      const res = await request(app).get('/api/posts/admin-test-post');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/posts/:id', () => {
    let postId: number;

    beforeAll(async () => {
      const { rows } = await getPool().query<{ id: number }>('SELECT id FROM posts WHERE slug = $1', ['admin-test-post']);
      postId = rows[0].id;
    });

    it('rejects requests with no token', async () => {
      const res = await request(app).put(`/api/posts/${postId}`).send(validPost);
      expect(res.status).toBe(401);
    });

    it('returns 404 for a non-existent id', async () => {
      const res = await request(app).put('/api/posts/999999').set('Authorization', `Bearer ${adminToken}`).send(validPost);
      expect(res.status).toBe(404);
    });

    it('updates the post, and publishing for the first time sets publishedAt', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validPost, status: 'published', title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.post.title).toBe('Updated Title');
      expect(res.body.post.status).toBe('published');
      expect(res.body.post.publishedAt).toBeTruthy();
    });

    it('is now publicly visible after publishing', async () => {
      const res = await request(app).get('/api/posts/admin-test-post');
      expect(res.status).toBe(200);
      expect(res.body.post.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let postId: number;

    beforeAll(async () => {
      const { rows } = await getPool().query<{ id: number }>('SELECT id FROM posts WHERE slug = $1', ['admin-test-post']);
      postId = rows[0].id;
    });

    it('rejects requests with no token', async () => {
      const res = await request(app).delete(`/api/posts/${postId}`);
      expect(res.status).toBe(401);
    });

    it('returns 404 for a non-existent id', async () => {
      const res = await request(app).delete('/api/posts/999999').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('deletes the post with a valid token', async () => {
      const res = await request(app).delete(`/api/posts/${postId}`).set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(204);
    });

    it('the post is gone', async () => {
      const res = await request(app).get('/api/posts/admin-test-post');
      expect(res.status).toBe(404);
    });
  });
});
