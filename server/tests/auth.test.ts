import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';

describe('POST /api/auth/login', () => {
  const app = createApp();

  beforeAll(() => {
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.JWT_SECRET = 'test-secret-not-for-real-use';
    // Low cost factor (4) just to keep the test suite fast — production
    // uses the default cost from hash-password.js.
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-horse-battery-staple', 4);
  });

  it('returns a token for correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'correct-horse-battery-staple' });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
  });

  it('matches the admin email case-insensitively', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADMIN@TEST.COM', password: 'correct-horse-battery-staple' });

    expect(res.status).toBe(200);
  });

  it('rejects the wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('rejects the wrong email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'someone-else@test.com', password: 'correct-horse-battery-staple' });

    expect(res.status).toBe(401);
  });

  it('rejects a missing password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com' });
    expect(res.status).toBe(400);
  });

  it('rejects a missing email', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'correct-horse-battery-staple' });
    expect(res.status).toBe(400);
  });

  it('does not reveal whether the email or the password was wrong', async () => {
    const wrongEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'correct-horse-battery-staple' });
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'nope' });

    expect(wrongEmail.body.error).toBe(wrongPassword.body.error);
  });
});
