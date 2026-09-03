import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';

// Same real-Postgres requirement as migrate.test.ts — see that file for
// why this skips cleanly instead of failing when DATABASE_URL is unset.
const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('/api/posts', () => {
  const app = createApp();

  beforeAll(async () => {
    await runMigrations();
    await getPool().query('TRUNCATE posts RESTART IDENTITY CASCADE');
    await getPool().query(
      `INSERT INTO posts (slug, title, excerpt, content, status, published_at) VALUES
       ($1, $2, $3, $4, 'published', now() - interval '1 day'),
       ($5, $6, $7, $8, 'published', now()),
       ($9, $10, $11, $12, 'draft', NULL)`,
      [
        'first-post',
        'First Post',
        'The first one',
        'Full content of the first post',
        'second-post',
        'Second Post',
        'The second one',
        'Full content of the second post',
        'draft-post',
        'Draft Post',
        'Not ready yet',
        'Draft content',
      ]
    );
  });

  afterAll(async () => {
    await getPool().end();
  });

  describe('GET /api/posts', () => {
    it('returns only published posts, newest first', async () => {
      const res = await request(app).get('/api/posts');

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(2);
      expect(res.body.posts[0].slug).toBe('second-post');
      expect(res.body.posts[1].slug).toBe('first-post');
    });

    it('does not include draft posts', async () => {
      const res = await request(app).get('/api/posts');
      const slugs = res.body.posts.map((p: { slug: string }) => p.slug);
      expect(slugs).not.toContain('draft-post');
    });

    it('does not include full content in the list view', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.body.posts[0].content).toBeUndefined();
    });
  });

  describe('GET /api/posts/:slug', () => {
    it('returns the full post for a published slug', async () => {
      const res = await request(app).get('/api/posts/first-post');

      expect(res.status).toBe(200);
      expect(res.body.post.slug).toBe('first-post');
      expect(res.body.post.content).toBe('Full content of the first post');
    });

    it('returns 404 for a draft slug (not publicly visible)', async () => {
      const res = await request(app).get('/api/posts/draft-post');
      expect(res.status).toBe(404);
    });

    it('returns 404 for a slug that does not exist', async () => {
      const res = await request(app).get('/api/posts/does-not-exist');
      expect(res.status).toBe(404);
    });
  });
});
