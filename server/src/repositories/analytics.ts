import { getPool } from '../db/pool.js';

const MAX_PATH_LENGTH = 200;

export interface AnalyticsSummary {
  totalViews: number;
  viewsByPath: { path: string; count: number }[];
  viewsLast7Days: { date: string; count: number }[];
}

/** Records a single page view. Paths are truncated defensively — this is a count, not a security boundary. */
export async function recordPageView(path: string): Promise<void> {
  const safePath = path.slice(0, MAX_PATH_LENGTH);
  await getPool().query('INSERT INTO page_views (path) VALUES ($1)', [safePath]);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const pool = getPool();

  const totalResult = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM page_views');
  const totalViews = Number(totalResult.rows[0].count);

  const byPathResult = await pool.query<{ path: string; count: string }>(
    `SELECT path, COUNT(*) AS count FROM page_views GROUP BY path ORDER BY count DESC LIMIT 20`
  );
  const viewsByPath = byPathResult.rows.map(row => ({ path: row.path, count: Number(row.count) }));

  const last7Result = await pool.query<{ date: string; count: string }>(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*) AS count
     FROM page_views
     WHERE created_at >= now() - interval '7 days'
     GROUP BY date
     ORDER BY date ASC`
  );
  const viewsLast7Days = last7Result.rows.map(row => ({ date: row.date, count: Number(row.count) }));

  return { totalViews, viewsByPath, viewsLast7Days };
}
