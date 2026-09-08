import { describe, it, expect, beforeEach, vi } from 'vitest';

const FIXTURE = `
  <div id="scroll-progress"></div>
  <header id="site-header">
    <button id="theme-toggle"><span id="theme-toggle-thumb"></span></button>
    <button id="menu-btn" aria-expanded="false"></button>
  </header>
  <div id="mobile-nav"></div>

  <div id="blog-post-loading"></div>
  <div id="blog-post-not-found" hidden></div>
  <article id="blog-post" hidden>
    <span id="blog-post-date"></span>
    <h1 id="blog-post-title"></h1>
    <div id="blog-post-content"></div>
  </article>
  <title id="page-title">Blog — Mahmoud Mohamed</title>

  <span id="footer-year"></span>
`;

async function loadBlogPost(search: string) {
  document.body.innerHTML = FIXTURE;
  window.history.replaceState({}, '', `/blog-post.html${search}`);
  vi.resetModules();
  await import('../src/blog-post');
}

describe('blog-post.ts', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('shows "not found" when there is no slug in the URL', async () => {
    await loadBlogPost('');
    await vi.waitFor(() => {
      expect(document.getElementById('blog-post-not-found')?.hidden).toBe(false);
    });
  });

  it('shows "not found" when the API returns no post for the slug', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await loadBlogPost('?slug=missing');

    await vi.waitFor(() => {
      expect(document.getElementById('blog-post-not-found')?.hidden).toBe(false);
    });
    expect(document.getElementById('blog-post')?.hidden).toBe(true);

    vi.unstubAllGlobals();
  });

  it('renders the post title, date, and sanitized content on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          post: {
            slug: 'hello-world',
            title: 'Hello, World',
            excerpt: 'First post',
            publishedAt: '2026-01-01T00:00:00.000Z',
            content: '# Hi\n\nSome <script>alert(1)</script> content.',
          },
        }),
      })
    );

    await loadBlogPost('?slug=hello-world');

    await vi.waitFor(() => {
      expect(document.getElementById('blog-post')?.hidden).toBe(false);
    });

    expect(document.getElementById('blog-post-title')?.textContent).toBe('Hello, World');
    expect(document.getElementById('blog-post-date')?.textContent).toBe('January 1, 2026');

    const content = document.getElementById('blog-post-content') as HTMLElement;
    expect(content.innerHTML).toContain('<h1>Hi</h1>');
    expect(content.innerHTML).not.toContain('<script>');

    expect(document.getElementById('page-title')?.textContent).toBe('Hello, World — Mahmoud Mohamed');

    vi.unstubAllGlobals();
  });
});
