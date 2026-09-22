import { describe, it, expect, beforeEach, vi } from 'vitest';

const FIXTURE = `
  <header id="site-header">
    <button id="theme-toggle"><span id="theme-toggle-thumb"></span></button>
    <button id="palette-trigger" aria-expanded="false"></button>
    <div id="palette-menu" hidden>
      <button class="palette-picker__swatch" data-palette="1"></button>
    </div>
    <button id="logout-btn">Log out</button>
  </header>

  <p id="auth-checking"></p>

  <section id="dashboard-view" hidden>
    <span id="stat-views"></span>
    <span id="stat-posts"></span>
    <span id="stat-posts-breakdown"></span>
    <span id="stat-messages"></span>

    <table id="posts-table" hidden><tbody id="posts-table-body"></tbody></table>
    <p id="posts-loading"></p>
    <p id="posts-empty" hidden></p>

    <div id="messages-list"></div>
    <p id="messages-loading"></p>
    <p id="messages-empty" hidden></p>
  </section>

  <section id="editor-view" hidden>
    <h2 id="editor-title"></h2>
    <form id="post-form">
      <input id="post-title" />
      <input id="post-slug" />
      <textarea id="post-excerpt"></textarea>
      <textarea id="post-content"></textarea>
      <select id="post-status"><option value="draft">draft</option><option value="published">published</option></select>
      <p id="editor-error" hidden></p>
      <p id="editor-success" hidden></p>
      <button type="submit" id="editor-save-btn">Save</button>
      <button type="button" id="editor-delete-btn" hidden>Delete</button>
    </form>
  </section>

  <div id="confirm-modal" hidden>
    <p id="confirm-message"></p>
    <button id="confirm-cancel">Cancel</button>
    <button id="confirm-ok">Confirm</button>
  </div>
`;

// NOTE: earlier versions of these tests replaced `window.location` wholesale
// (`delete window.location; window.location = { href: '' }`) to make
// assertions easy. That corrupts `window.location` for every later test in
// this file — `window` persists across tests within one file, only
// `document.body` gets reset here — which silently broke `history.replaceState`
// for the editor-mode tests further down (parseEditorMode read an empty
// `search` and the dashboard rendered instead of the editor). Fixed by never
// replacing `window.location`: jsdom supports assigning `.href` directly
// (it logs a harmless "Not implemented: navigation" notice, same as the
// canvas.getContext notices elsewhere in this suite) and the value reads
// back correctly afterward — assertions below just check it with `toContain`
// since the read-back value is a full resolved URL, not the bare filename.

async function loadAdminPage(search = '') {
  document.body.innerHTML = FIXTURE;
  window.history.replaceState({}, '', `/admin.html${search}`);
  vi.resetModules();
  await import('../src/admin');
}

describe('admin.ts', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('redirects to login when there is no session token', async () => {
    await loadAdminPage();

    await vi.waitFor(() => {
      expect(window.location.href).toContain('admin-login.html');
    });
  });

  describe('dashboard mode', () => {
    beforeEach(() => {
      window.sessionStorage.setItem('admin-session-token', 'valid-token');
    });

    it('redirects to login when the posts fetch fails (expired session)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));

      await loadAdminPage();

      await vi.waitFor(() => {
        expect(window.location.href).toContain('admin-login.html');
      });
      expect(window.sessionStorage.getItem('admin-session-token')).toBeNull();

      vi.unstubAllGlobals();
    });

    it('renders posts, messages, and stats on success', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/admin/posts')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              posts: [
                { id: 1, slug: 'a', title: 'Post A', status: 'published', publishedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' },
                { id: 2, slug: 'b', title: 'Post B', status: 'draft', publishedAt: null, updatedAt: '2026-01-03T00:00:00.000Z' },
              ],
            }),
          });
        }
        if (url.includes('/api/admin/contact-messages')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ messages: [{ id: 1, name: 'Someone', email: 'a@b.com', message: 'Hi', createdAt: '2026-01-01T00:00:00.000Z' }] }),
          });
        }
        if (url.includes('/api/admin/analytics/summary')) {
          return Promise.resolve({ ok: true, json: async () => ({ totalViews: 42, viewsByPath: [], viewsLast7Days: [] }) });
        }
        return Promise.resolve({ ok: false });
      });
      vi.stubGlobal('fetch', fetchMock);

      await loadAdminPage();

      // Wait for the LAST thing the async chain sets (analytics resolves
      // after posts and messages) — waiting on an earlier signal like
      // posts-table visibility let this assertion run before stats were
      // actually populated, which was the real cause of the first failure.
      await vi.waitFor(() => {
        expect(document.getElementById('stat-views')?.textContent).toBe('42');
      });

      expect(document.getElementById('posts-table')?.hidden).toBe(false);
      expect(document.getElementById('posts-table-body')?.innerHTML).toContain('Post A');
      expect(document.getElementById('stat-posts')?.textContent).toBe('2');
      expect(document.getElementById('stat-messages')?.textContent).toBe('1');
      expect(document.getElementById('messages-list')?.innerHTML).toContain('Someone');

      vi.unstubAllGlobals();
    });
  });

  describe('editor mode', () => {
    beforeEach(() => {
      window.sessionStorage.setItem('admin-session-token', 'valid-token');
    });

    it('shows an empty form for ?post=new', async () => {
      vi.stubGlobal('fetch', vi.fn());
      await loadAdminPage('?post=new');

      await vi.waitFor(() => {
        expect(document.getElementById('editor-view')?.hidden).toBe(false);
      });
      expect(document.getElementById('editor-title')?.textContent).toBe('New post');
      expect(document.getElementById('editor-delete-btn')?.hidden).toBe(true);

      vi.unstubAllGlobals();
    });

    it('pre-fills the form for ?post=<id>', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            post: { id: 5, slug: 'my-post', title: 'My Post', excerpt: 'Ex', content: 'Full content', status: 'draft', publishedAt: null },
          }),
        })
      );

      await loadAdminPage('?post=5');

      await vi.waitFor(() => {
        expect((document.getElementById('post-title') as HTMLInputElement).value).toBe('My Post');
      });
      expect((document.getElementById('post-slug') as HTMLInputElement).value).toBe('my-post');
      expect(document.getElementById('editor-delete-btn')?.hidden).toBe(false);

      vi.unstubAllGlobals();
    });

    it('creates a post on submit for ?post=new', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 });
      vi.stubGlobal('fetch', fetchMock);

      await loadAdminPage('?post=new');
      await vi.waitFor(() => {
        expect(document.getElementById('editor-view')?.hidden).toBe(false);
      });

      (document.getElementById('post-title') as HTMLInputElement).value = 'New Title';
      (document.getElementById('post-slug') as HTMLInputElement).value = 'new-title';
      (document.getElementById('post-excerpt') as HTMLTextAreaElement).value = 'Excerpt';
      (document.getElementById('post-content') as HTMLTextAreaElement).value = 'Content';

      document.getElementById('post-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.waitFor(() => {
        expect(document.getElementById('editor-success')?.hidden).toBe(false);
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts'),
        expect.objectContaining({ method: 'POST' })
      );

      vi.unstubAllGlobals();
    });

    it('shows validation errors returned by the API', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ errors: ['slug is required'] }) })
      );

      await loadAdminPage('?post=new');
      await vi.waitFor(() => {
        expect(document.getElementById('editor-view')?.hidden).toBe(false);
      });

      document.getElementById('post-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.waitFor(() => {
        expect(document.getElementById('editor-error')?.hidden).toBe(false);
      });
      expect(document.getElementById('editor-error')?.textContent).toBe('slug is required');

      vi.unstubAllGlobals();
    });
  });
});
