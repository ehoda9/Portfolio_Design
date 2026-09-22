import { describe, it, expect, beforeEach } from 'vitest';
import { clearSessionToken, getSessionToken, setSessionToken } from '../src/lib/admin-session';

describe('admin session token', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('returns null when no token is stored', () => {
    expect(getSessionToken()).toBeNull();
  });

  it('stores and retrieves a token', () => {
    setSessionToken('a.jwt.token');
    expect(getSessionToken()).toBe('a.jwt.token');
  });

  it('clears the stored token', () => {
    setSessionToken('a.jwt.token');
    clearSessionToken();
    expect(getSessionToken()).toBeNull();
  });

  it('overwrites a previously stored token', () => {
    setSessionToken('first');
    setSessionToken('second');
    expect(getSessionToken()).toBe('second');
  });
});
