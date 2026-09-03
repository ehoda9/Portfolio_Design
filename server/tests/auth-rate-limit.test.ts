import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';

// In its own file (not alongside auth.test.ts) so its request count doesn't
// interact with — or get thrown off by — the functional login tests. Each
// vitest test file gets its own isolated module registry, so the limiter's
// internal counter starts fresh here regardless of what auth.test.ts did.
describe('login rate limiting', () => {
  const app = createApp();

  beforeAll(() => {
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.JWT_SECRET = 'test-secret-not-for-real-use';
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-horse-battery-staple', 4);
  });

  it('locks out further attempts once the limit is hit', async () => {
    const attempt = () =>
      request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'wrong-password' });

    // loginLimiter allows 10 requests per window (see src/middleware/rate-limiters.ts).
    for (let i = 0; i < 10; i++) {
      const res = await attempt();
      expect(res.status).toBe(401); // wrong password, but still under the rate limit
    }

    const res = await attempt();
    expect(res.status).toBe(429);
  });
});
