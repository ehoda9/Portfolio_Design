import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/**
 * Strict limit on login attempts specifically — this is the endpoint
 * someone would brute-force a password against. There is exactly one
 * admin account, so 10 attempts per IP per 15 minutes is generous for
 * the real user and still shuts down credential-guessing.
 */
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

/**
 * A light ceiling across the whole API so no single client can flood it
 * with requests (scraping, accidental retry loops, etc.). This is a
 * single-author portfolio site, not a high-traffic service — 300
 * requests per IP per 15 minutes comfortably covers a real visitor
 * browsing the blog while still capping runaway traffic.
 */
export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});

/**
 * A tighter limit specifically on contact form submissions — separate
 * from the general API ceiling, since this endpoint writes to the
 * database and is the obvious target for spam bots. 5 submissions per
 * IP per 15 minutes is far more than a real visitor sends.
 */
export const contactLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later.' },
});
