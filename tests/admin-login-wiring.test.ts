import { describe, it, expect, beforeEach, vi } from 'vitest';

const FIXTURE = `
  <form id="login-form">
    <input id="login-email" type="email" />
    <input id="login-password" type="password" />
    <p id="login-error" hidden></p>
    <button id="login-submit" type="submit">Sign in</button>
  </form>
`;

// See the note at the top of admin-wiring.test.ts: these tests deliberately
// never replace `window.location` wholesale (that corrupted a later test
// file's URL-based assertions) — they just assign `.href` and read it back
// with `toContain`, since the resolved value is a full URL, not the bare
// filename that was assigned.

async function loadLoginPage() {
  document.body.innerHTML = FIXTURE;
  vi.resetModules();
  await import('../src/admin-login');
}

describe('admin-login.ts', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('redirects to the dashboard immediately if already signed in', async () => {
    window.sessionStorage.setItem('admin-session-token', 'existing-token');

    await loadLoginPage();

    await vi.waitFor(() => {
      expect(window.location.href).toContain('admin.html');
    });
  });

  it('shows an error and does not store a token on failed login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await loadLoginPage();

    (document.getElementById('login-email') as HTMLInputElement).value = 'a@b.com';
    (document.getElementById('login-password') as HTMLInputElement).value = 'wrong';
    document.getElementById('login-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      expect(document.getElementById('login-error')?.hidden).toBe(false);
    });
    expect(window.sessionStorage.getItem('admin-session-token')).toBeNull();

    vi.unstubAllGlobals();
  });

  it('stores the token and redirects to the dashboard on successful login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'a.b.c' }) }));

    await loadLoginPage();

    (document.getElementById('login-email') as HTMLInputElement).value = 'a@b.com';
    (document.getElementById('login-password') as HTMLInputElement).value = 'right';
    document.getElementById('login-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      expect(window.sessionStorage.getItem('admin-session-token')).toBe('a.b.c');
    });
    expect(window.location.href).toContain('admin.html');

    vi.unstubAllGlobals();
  });
});
