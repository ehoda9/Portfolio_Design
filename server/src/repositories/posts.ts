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

export interface AdminPost extends PostDetail {
  id: number;
  status: 'draft' | 'published';
}

interface AdminPostRow extends PostDetailRow {
  id: number;
  status: 'draft' | 'published';
}

function toAdminPost(row: AdminPostRow): AdminPost {
  return { ...toSummary(row), id: row.id, content: row.content, status: row.status };
}

export interface CreatePostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
}

/**
 * Creates a post. If status is 'published', published_at is set to now —
 * there's no separate "schedule for later" concept here.
 */
export async function createPost(input: CreatePostInput): Promise<AdminPost> {
  const { rows } = await getPool().query<AdminPostRow>(
    `INSERT INTO posts (slug, title, excerpt, content, status, published_at)
     VALUES ($1, $2, $3, $4, $5, CASE WHEN $5 = 'published' THEN now() ELSE NULL END)
     RETURNING id, slug, title, excerpt, content, status, published_at`,
    [input.slug, input.title, input.excerpt, input.content, input.status]
  );
  return toAdminPost(rows[0]);
}

/** Any post by id, regardless of status — for admin use (edit/delete need to see drafts too). */
export async function getPostById(id: number): Promise<AdminPost | null> {
  const { rows } = await getPool().query<AdminPostRow>(
    `SELECT id, slug, title, excerpt, content, status, published_at FROM posts WHERE id = $1`,
    [id]
  );
  const row = rows[0];
  return row ? toAdminPost(row) : null;
}

export type UpdatePostInput = CreatePostInput;

/**
 * Full update of a post. Going from any status to 'published' for the
 * first time sets published_at; it's left untouched on subsequent edits
 * so re-saving a published post doesn't bump its publish date.
 */
export async function updatePost(id: number, input: UpdatePostInput): Promise<AdminPost | null> {
  const { rows } = await getPool().query<AdminPostRow>(
    `UPDATE posts
     SET slug = $1,
         title = $2,
         excerpt = $3,
         content = $4,
         status = $5,
         published_at = CASE
           WHEN $5 = 'published' AND published_at IS NULL THEN now()
           ELSE published_at
         END,
         updated_at = now()
     WHERE id = $6
     RETURNING id, slug, title, excerpt, content, status, published_at`,
    [input.slug, input.title, input.excerpt, input.content, input.status, id]
  );
  const row = rows[0];
  return row ? toAdminPost(row) : null;
}

/** Returns true if a post existed and was deleted. */
export async function deletePost(id: number): Promise<boolean> {
  const { rowCount } = await getPool().query('DELETE FROM posts WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
