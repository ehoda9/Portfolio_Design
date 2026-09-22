import { describe, it, expect, afterEach, vi } from 'vitest';
import { recordPageView } from '../src/lib/analytics';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('recordPageView', () => {
  it('POSTs the path to the analytics endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await recordPageView('http://localhost:3000', '/blog.html');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/analytics/pageview',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/blog.html' }),
      })
    );
  });

  it('does not throw when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await expect(recordPageView('http://localhost:3000', '/blog.html')).resolves.toBeUndefined();
  });

  it('does not throw when the server responds with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(recordPageView('http://localhost:3000', '/blog.html')).resolves.toBeUndefined();
  });
});
