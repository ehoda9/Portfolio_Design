import { getPool } from '../db/pool.js';

export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
}

export interface PostDetail extends PostSummary {
  content: string;
}

interface PostSummaryRow {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
}

interface PostDetailRow extends PostSummaryRow {
  content: string;
}

function toSummary(row: PostSummaryRow): PostSummary {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: row.published_at,
  };
}

/** Published posts only, newest first. No `content` field — keeps the list light. */
export async function listPublishedPosts(): Promise<PostSummary[]> {
  const { rows } = await getPool().query<PostSummaryRow>(
    `SELECT slug, title, excerpt, published_at
     FROM posts
     WHERE status = 'published'
     ORDER BY published_at DESC`
  );
  return rows.map(toSummary);
}

/** A single published post with full content, or null if it doesn't exist / isn't published. */
export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  const { rows } = await getPool().query<PostDetailRow>(
    `SELECT slug, title, excerpt, content, published_at
     FROM posts
     WHERE status = 'published' AND slug = $1`,
    [slug]
  );
  const row = rows[0];
  return row ? { ...toSummary(row), content: row.content } : null;
}
