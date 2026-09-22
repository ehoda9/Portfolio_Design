const STORAGE_KEY = 'admin-session-token';

/**
 * sessionStorage, deliberately not localStorage — the admin token
 * shouldn't outlive the browser tab. See ARCHITECTURE.md "API security
 * posture" for why this is a bearer token here rather than an httpOnly
 * cookie (this site's frontend and API are different origins).
 */
export function getSessionToken(): string | null {
  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function setSessionToken(token: string): void {
  window.sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearSessionToken(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
}
