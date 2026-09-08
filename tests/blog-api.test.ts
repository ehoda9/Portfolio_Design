import { describe, it, expect, afterEach, vi } from 'vitest';
import { fetchPostBySlug, fetchPublishedPosts } from '../src/lib/blog-api';

const samplePosts = [
  { slug: 'a', title: 'A', excerpt: 'a', publishedAt: '2026-01-01T00:00:00.000Z' },
  { slug: 'b', title: 'B', excerpt: 'b', publishedAt: '2026-02-01T00:00:00.000Z' },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchPublishedPosts', () => {
  it('returns the posts array on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ posts: samplePosts }) }));

    expect(await fetchPublishedPosts('http://api.test')).toEqual(samplePosts);
  });

  it('requests the correct URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ posts: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchPublishedPosts('http://api.test');

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/api/posts');
  });

  it('returns null on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchPublishedPosts('http://api.test')).toBeNull();
  });

  it('returns null when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    expect(await fetchPublishedPosts('http://api.test')).toBeNull();
  });

  it('returns null when the response shape is unexpected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ notPosts: true }) }));
    expect(await fetchPublishedPosts('http://api.test')).toBeNull();
  });
});

describe('fetchPostBySlug', () => {
  it('returns the post on success', async () => {
    const post = { ...samplePosts[0], content: 'full body' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ post }) }));

    expect(await fetchPostBySlug('http://api.test', 'a')).toEqual(post);
  });

  it('URL-encodes the slug', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ post: null }) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchPostBySlug('http://api.test', 'a slug/with stuff');

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/api/posts/a%20slug%2Fwith%20stuff');
  });

  it('returns null on a 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchPostBySlug('http://api.test', 'missing')).toBeNull();
  });

  it('returns null when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    expect(await fetchPostBySlug('http://api.test', 'a')).toBeNull();
  });
});
