import { describe, it, expect, beforeEach, vi } from 'vitest';

const FIXTURE = `
  <div id="scroll-progress"></div>
  <header id="site-header">
    <button id="theme-toggle"><span id="theme-toggle-thumb"></span></button>
    <button id="menu-btn" aria-expanded="false"></button>
  </header>
  <div id="mobile-nav"></div>

  <div id="blog-list-loading"></div>
  <div id="blog-list-empty" hidden></div>
  <div id="blog-list-error" hidden></div>
  <div id="blog-list" hidden></div>

  <span id="footer-year"></span>
`;

async function loadBlogList() {
  document.body.innerHTML = FIXTURE;
  vi.resetModules();
  await import('../src/blog');
}

describe('blog.ts', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('renders post cards on a successful fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          posts: [{ slug: 'hello-world', title: 'Hello, World', excerpt: 'First post', publishedAt: '2026-01-01T00:00:00.000Z' }],
        }),
      })
    );

    await loadBlogList();

    await vi.waitFor(() => {
      expect(document.getElementById('blog-list')?.hidden).toBe(false);
    });

    const list = document.getElementById('blog-list') as HTMLElement;
    expect(list.innerHTML).toContain('Hello, World');
    expect(list.innerHTML).toContain('href="blog-post.html?slug=hello-world"');
    expect(document.getElementById('blog-list-loading')?.hidden).toBe(true);

    vi.unstubAllGlobals();
  });

  it('escapes HTML in post titles/excerpts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          posts: [{ slug: 'x', title: '<img src=x onerror=alert(1)>', excerpt: 'safe', publishedAt: '2026-01-01T00:00:00.000Z' }],
        }),
      })
    );

    await loadBlogList();

    await vi.waitFor(() => {
      expect(document.getElementById('blog-list')?.hidden).toBe(false);
    });

    const list = document.getElementById('blog-list') as HTMLElement;
    expect(list.innerHTML).not.toContain('<img src=x onerror');
    expect(list.innerHTML).toContain('&lt;img');

    vi.unstubAllGlobals();
  });

  it('shows the empty state when there are no posts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ posts: [] }) }));

    await loadBlogList();

    await vi.waitFor(() => {
      expect(document.getElementById('blog-list-empty')?.hidden).toBe(false);
    });
    expect(document.getElementById('blog-list')?.hidden).toBe(true);

    vi.unstubAllGlobals();
  });

  it('shows the error state when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await loadBlogList();

    await vi.waitFor(() => {
      expect(document.getElementById('blog-list-error')?.hidden).toBe(false);
    });

    vi.unstubAllGlobals();
  });
});
