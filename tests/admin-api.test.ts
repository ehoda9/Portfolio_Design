import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  adminLogin,
  createPost,
  deletePost,
  fetchAdminPost,
  fetchAdminPosts,
  fetchAnalyticsSummary,
  fetchContactMessages,
  updatePost,
} from '../src/lib/admin-api';

const BASE = 'http://localhost:3000';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('adminLogin', () => {
  it('returns the token on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'abc.def.ghi' }) }));
    expect(await adminLogin(BASE, 'a@b.com', 'pw')).toBe('abc.def.ghi');
  });

  it('returns null on invalid credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await adminLogin(BASE, 'a@b.com', 'wrong')).toBeNull();
  });

  it('returns null on a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await adminLogin(BASE, 'a@b.com', 'pw')).toBeNull();
  });
});

describe('fetchAdminPosts', () => {
  it('returns the posts array on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ posts: [{ id: 1 }] }) }));
    expect(await fetchAdminPosts(BASE, 'token')).toEqual([{ id: 1 }]);
  });

  it('returns null on a 401 (expired session)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    expect(await fetchAdminPosts(BASE, 'token')).toBeNull();
  });

  it('sends the bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ posts: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchAdminPosts(BASE, 'my-token');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/admin/posts`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer my-token' }) })
    );
  });
});

describe('fetchAdminPost', () => {
  it('returns the post on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ post: { id: 5 } }) }));
    expect(await fetchAdminPost(BASE, 'token', 5)).toEqual({ id: 5 });
  });

  it('returns null on a 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await fetchAdminPost(BASE, 'token', 999)).toBeNull();
  });
});

describe('fetchContactMessages', () => {
  it('returns the messages array on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ messages: [{ id: 1 }] }) }));
    expect(await fetchContactMessages(BASE, 'token')).toEqual([{ id: 1 }]);
  });

  it('returns null on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await fetchContactMessages(BASE, 'token')).toBeNull();
  });
});

describe('fetchAnalyticsSummary', () => {
  it('returns the summary on success', async () => {
    const summary = { totalViews: 10, viewsByPath: [], viewsLast7Days: [] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => summary }));
    expect(await fetchAnalyticsSummary(BASE, 'token')).toEqual(summary);
  });
});

const formValues = { slug: 'a', title: 'A', excerpt: 'e', content: 'c', status: 'draft' as const };

describe('createPost', () => {
  it('returns ok:true on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 201 }));
    const result = await createPost(BASE, 'token', formValues);
    expect(result).toEqual({ ok: true, status: 201, errors: undefined });
  });

  it('returns validation errors on a 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ errors: ['title is required'] }) })
    );
    const result = await createPost(BASE, 'token', formValues);
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['title is required']);
  });

  it('returns a network-error result when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    const result = await createPost(BASE, 'token', formValues);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
  });
});

describe('updatePost', () => {
  it('returns ok:true on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const result = await updatePost(BASE, 'token', 1, formValues);
    expect(result.ok).toBe(true);
  });

  it('returns a single error message on a plain error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: 'slug taken' }) }));
    const result = await updatePost(BASE, 'token', 1, formValues);
    expect(result.errors).toEqual(['slug taken']);
  });
});

describe('deletePost', () => {
  it('returns true on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    expect(await deletePost(BASE, 'token', 1)).toBe(true);
  });

  it('returns false on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await deletePost(BASE, 'token', 1)).toBe(false);
  });

  it('returns false when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await deletePost(BASE, 'token', 1)).toBe(false);
  });
});
