import pg from 'pg';

const { Pool } = pg;

let cachedPool: pg.Pool | undefined;

/**
 * Returns a shared connection pool, creating it on first use. DATABASE_URL
 * is only read (and validated) here — at call time — not at module import
 * time, so importing this file (or anything that imports it) never fails
 * just because no database is configured, e.g. in tests that don't need one.
 */
export function getPool(): pg.Pool {
  if (!cachedPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    cachedPool = new Pool({ connectionString });
  }
  return cachedPool;
}
