import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

const validSubmission = {
  name: 'Mahmoud',
  email: 'mahmoud@example.com',
  message: 'I would like to hire you for a project.',
};

describeIfDb('POST /api/contact', () => {
  const app = createApp();

  beforeAll(async () => {
    await runMigrations();
    await getPool().query('TRUNCATE contact_messages RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await getPool().end();
  });

  it('rejects invalid input with 400 and no auth required', async () => {
    const res = await request(app).post('/api/contact').send({ name: '', email: '', message: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('rejects a malformed email', async () => {
    const res = await request(app).post('/api/contact').send({ ...validSubmission, email: 'nope' });
    expect(res.status).toBe(400);
  });

  it('accepts a valid submission and persists it', async () => {
    const res = await request(app).post('/api/contact').send(validSubmission);

    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('number');
    expect(res.body.createdAt).toBeTruthy();

    const { rows } = await getPool().query('SELECT name, email, message FROM contact_messages WHERE id = $1', [res.body.id]);
    expect(rows[0]).toEqual({
      name: validSubmission.name,
      email: validSubmission.email,
      message: validSubmission.message,
    });
  });

  it('does not require an Authorization header (public endpoint)', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validSubmission, email: 'someone-else@example.com' });
    expect(res.status).toBe(201);
  });
});
