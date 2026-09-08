export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
}

export interface PostDetail extends PostSummary {
  content: string;
}

/** Fetches the published posts list. Returns null on any failure (network error, non-2xx, bad shape). */
export async function fetchPublishedPosts(apiBaseUrl: string): Promise<PostSummary[] | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/posts`);
    if (!res.ok) return null;
    const data = (await res.json()) as { posts?: PostSummary[] };
    return Array.isArray(data.posts) ? data.posts : null;
  } catch {
    return null;
  }
}

/** Fetches a single published post by slug. Returns null if missing, unpublished, or on any failure. */
export async function fetchPostBySlug(apiBaseUrl: string, slug: string): Promise<PostDetail | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/posts/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { post?: PostDetail };
    return data.post ?? null;
  } catch {
    return null;
  }
}
