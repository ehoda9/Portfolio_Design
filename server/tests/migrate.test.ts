import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';

// Requires a real Postgres reachable at DATABASE_URL — provided by
// docker-compose locally, and by the `postgres:` service container in
// CI (see .github/workflows/ci.yml). Skips cleanly if it's not set,
// rather than failing the whole suite when running `npm test` for the
// route-level tests alone.
const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('runMigrations', () => {
  beforeAll(async () => {
    // Start from a clean slate so this test is repeatable.
    await getPool().query('DROP TABLE IF EXISTS posts, contact_messages, schema_migrations CASCADE');
  });

  afterAll(async () => {
    await getPool().end();
  });

  it('applies every migration and records them in schema_migrations', async () => {
    const applied = await runMigrations();

    expect(applied).toEqual(['0001_create_posts.sql', '0002_create_contact_messages.sql']);

    const { rows } = await getPool().query<{ name: string }>('SELECT name FROM schema_migrations ORDER BY name');
    expect(rows.map((r) => r.name)).toEqual(['0001_create_posts.sql', '0002_create_contact_messages.sql']);
  });

  it('creates the posts table with the expected columns', async () => {
    const { rows } = await getPool().query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' ORDER BY column_name`
    );
    const columns = rows.map((r) => r.column_name);

    expect(columns).toEqual(
      expect.arrayContaining(['id', 'slug', 'title', 'excerpt', 'content', 'status', 'published_at', 'created_at', 'updated_at'])
    );
  });

  it('creates the contact_messages table with the expected columns', async () => {
    const { rows } = await getPool().query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'contact_messages' ORDER BY column_name`
    );
    const columns = rows.map((r) => r.column_name);

    expect(columns).toEqual(expect.arrayContaining(['id', 'name', 'email', 'message', 'created_at']));
  });

  it('is idempotent — running it again applies nothing new', async () => {
    const applied = await runMigrations();
    expect(applied).toEqual([]);
  });

  it('rejects a post with an invalid status via the CHECK constraint', async () => {
    await expect(
      getPool().query(`INSERT INTO posts (slug, title, excerpt, content, status) VALUES ($1, $2, $3, $4, $5)`, [
        'test-post',
        'Test',
        'Excerpt',
        'Content',
        'not-a-real-status',
      ])
    ).rejects.toThrow();
  });

  it('rejects a duplicate slug via the UNIQUE constraint', async () => {
    await getPool().query(`INSERT INTO posts (slug, title, excerpt, content) VALUES ($1, $2, $3, $4)`, [
      'unique-slug-test',
      'Title',
      'Excerpt',
      'Content',
    ]);

    await expect(
      getPool().query(`INSERT INTO posts (slug, title, excerpt, content) VALUES ($1, $2, $3, $4)`, [
        'unique-slug-test',
        'Another title',
        'Excerpt',
        'Content',
      ])
    ).rejects.toThrow();
  });
});
